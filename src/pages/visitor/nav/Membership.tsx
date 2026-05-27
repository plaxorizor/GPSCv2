import React, { useState, useEffect } from "react";
import { auth } from "../../../firebase/config";
import type { User } from "firebase/auth";
import { GlobalStyles } from "../GlobalStyles";
import { PublicNav } from "../PublicNav";
import { Footer } from "../Footer";

const Membership: React.FC = () => {
  const [loggedUser, setLoggedUser] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setLoggedUser(user?.email ?? null);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen font-body text-gpsc-ink antialiased">
      <GlobalStyles />
      <PublicNav loggedUser={loggedUser} />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-gpsc-navy mb-4">Membership Packages</h1>
        <p className="text-gpsc-stone">
          Choose from Basic Care (₱698), Family Care (₱1,698), or Premium Care (₱4,998). Each package unlocks
          benefits like hospital cash, accidental/natural death assistance, maternity aid, and more.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Membership;