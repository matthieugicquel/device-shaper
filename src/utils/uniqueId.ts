const envId = Math.random().toString(36).slice(2, 5);
let id = 0;

export const getUniqueId = () => {
  id++;

  const idStr = id.toString().padStart(4, "0");

  return `${envId}-${idStr}`;
};
