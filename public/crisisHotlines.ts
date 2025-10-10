// data/crisisHotlines.ts

interface Hotline {
  name: string;
  phone: string; // The value for the href attribute
  phoneDisplay: string; // The text to display for the number/link
}

export const crisisHotlines: Record<string, Hotline> = {
  'en': { name: '988 Suicide & Crisis Lifeline', phone: 'tel:988', phoneDisplay: '988' },
  'es': { name: 'Teléfono de la Esperanza', phone: 'tel:717003717', phoneDisplay: '717 003 717' },
  'de': { name: 'Telefonseelsorge', phone: 'tel:08001110111', phoneDisplay: '0800 111 0 111' },
  'fr': { name: 'S.O.S Amitié', phone: 'tel:0972394050', phoneDisplay: '09 72 39 40 50' },
  'pt-pt': { name: 'SNS 24 - Aconselhamento Psicológico', phone: 'tel:808242424', phoneDisplay: '808 24 24 24' },
  'pt': { name: 'CVV - Centro de Valorização da Vida', phone: 'tel:188', phoneDisplay: '188' },
  'default': { name: 'Find a Helpline', phone: 'https://findahelpline.com/', phoneDisplay: 'findahelpline.com' }
};
