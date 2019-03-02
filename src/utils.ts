export const sanitizeName = (name: string) => {
  return name
    .replace(/[^0-z.-]/g, ' ')
    .trim()
    .replace(/[ ]/g, '-');
};
