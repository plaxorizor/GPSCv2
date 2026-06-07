// Philippine address dataset (PSGC), bundled locally — no runtime API calls.
// Province + city are small and imported eagerly; barangays (~4.6MB) are
// lazy-loaded on first use and cached, so the signup page stays light.
import provinceData from "./province.json";
import cityData from "./city.json";

export interface Province {
    province_code: string;
    province_name: string;
}
export interface City {
    city_code: string;
    city_name: string;
    province_code: string;
}
export interface Barangay {
    brgy_code: string;
    brgy_name: string;
    city_code: string;
}

// All provinces, alphabetical. The PSGC dataset duplicates a few province codes
// (e.g. NCR Manila appears twice under "1339"), so dedupe by code first.
const seenProvince = new Set<string>();
export const provinces: Province[] = (provinceData as Province[])
    .filter((p) => {
        if (seenProvince.has(p.province_code)) return false;
        seenProvince.add(p.province_code);
        return true;
    })
    .map((p) => ({ province_code: p.province_code, province_name: p.province_name }))
    .sort((a, b) => a.province_name.localeCompare(b.province_name));

// Cities / municipalities for a given province, alphabetical.
export const citiesByProvince = (provinceCode: string): City[] =>
    (cityData as City[])
        .filter((c) => c.province_code === provinceCode)
        .map((c) => ({ city_code: c.city_code, city_name: c.city_name, province_code: c.province_code }))
        .sort((a, b) => a.city_name.localeCompare(b.city_name));

// Barangays for a given city. Loads the big dataset once, then caches it.
let barangayCache: Barangay[] | null = null;
export const barangaysByCity = async (cityCode: string): Promise<Barangay[]> => {
    if (!barangayCache) {
        const mod = await import("./barangay.json");
        barangayCache = mod.default as Barangay[];
    }
    return barangayCache
        .filter((b) => b.city_code === cityCode)
        .map((b) => ({ brgy_code: b.brgy_code, brgy_name: b.brgy_name, city_code: b.city_code }))
        .sort((a, b) => a.brgy_name.localeCompare(b.brgy_name));
};
