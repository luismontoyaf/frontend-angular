export interface VariantDTO {
  name: string;
  atributes: { value: string }[];
}

export interface Variants {
  id: number,
  name: string,
  jsonValues: { value: string }[],
  state: boolean;
}