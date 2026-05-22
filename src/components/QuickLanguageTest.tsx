// components/QuickLanguageTest.tsx
"use client";

import { useTranslations } from "@/lib/i18n";

export const QuickLanguageTest = () => {
  const { lang, setLang, t } = useTranslations();

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "white",
        padding: "10px",
        border: "2px solid #ccc",
        borderRadius: "5px",
        zIndex: 9999,
      }}
    >
      <div style={{ fontSize: "12px", marginBottom: "5px" }}>
        Lang: <strong>{lang}</strong>
      </div>
      <button
        onClick={() => setLang("kh")}
        style={{ marginRight: "5px", padding: "2px 5px", fontSize: "10px" }}
      >
        KH
      </button>
      <button
        onClick={() => setLang("en")}
        style={{ padding: "2px 5px", fontSize: "10px" }}
      >
        EN
      </button>
      <div style={{ fontSize: "10px", marginTop: "5px" }}>
        Test: {t("login")}
      </div>
    </div>
  );
};
