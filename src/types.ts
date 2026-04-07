export type Note = {
  id: string;
  title: string;
  content: string;
  images: [string, string][];
  createdAt: number;
  updatedAt: number;
};
