export interface Professional {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string;
  whatsapp?: string;
  specialties: string[];
  customSpecialty?: string;
  state: string;
  city: string;
  bio: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  schedule: {
    segunda: { enabled: boolean; start: string; end: string };
    terca: { enabled: boolean; start: string; end: string };
    quarta: { enabled: boolean; start: string; end: string };
    quinta: { enabled: boolean; start: string; end: string };
    sexta: { enabled: boolean; start: string; end: string };
    sabado: { enabled: boolean; start: string; end: string };
    domingo: { enabled: boolean; start: string; end: string };
  };
  createdAt: Date;
  updatedAt: Date;
}
