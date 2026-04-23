import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AdminOverlayContextType {
  isAdmin: boolean;
  overlaysEnabled: boolean;
  setOverlaysEnabled: (v: boolean) => void;
  publicPreview: boolean;
  setPublicPreview: (v: boolean) => void;
}

const AdminOverlayContext = createContext<AdminOverlayContextType>({
  isAdmin: false,
  overlaysEnabled: true,
  setOverlaysEnabled: () => {},
  publicPreview: false,
  setPublicPreview: () => {},
});

export const useAdminOverlay = () => useContext(AdminOverlayContext);

const STORAGE_KEY = "flowentra_overlays_enabled";
const PREVIEW_KEY = "flowentra_public_preview";

export const AdminOverlayProvider = ({ children }: { children: ReactNode }) => {
  const isAdmin = !!localStorage.getItem("admin_token");
  const [overlaysEnabled, setOverlaysEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === "true" : true;
  });
  const [publicPreview, setPublicPreview] = useState(() => {
    return localStorage.getItem(PREVIEW_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(overlaysEnabled));
  }, [overlaysEnabled]);

  useEffect(() => {
    localStorage.setItem(PREVIEW_KEY, String(publicPreview));
  }, [publicPreview]);

  return (
    <AdminOverlayContext.Provider
      value={{ isAdmin, overlaysEnabled, setOverlaysEnabled, publicPreview, setPublicPreview }}
    >
      {children}
    </AdminOverlayContext.Provider>
  );
};
