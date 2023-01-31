export async function preloadImages(...srcArray: string[]) {
  const promises = await srcArray.map((src) => {
    return new Promise<void>(function (resolve, reject) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        resolve();
      };
      img.onerror = () => {
        reject();
      };
    });
  });
  await Promise.all(promises);
}
