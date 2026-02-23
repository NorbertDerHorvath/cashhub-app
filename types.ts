
export interface Deal {
  id: string;
  title: string;
  link: string;
  finalLink?: string;   // A legmagasabb prioritású link
  actionLink?: string;  // Speciális akciós link
  promoLink?: string;   // Alternatív promóciós link
  imageUrl?: string;
  expiryDate?: string;
  isReady: boolean | string;
  status?: string;
}
