/**
 * Continue execution if `continue` returns true.
 * @param periodMs Period of checking for stop condition, in milliseconds
 * @param condition
 */
export async function waitUntil(
  periodMs: number,
  condition: () => Promise<boolean>
) {
  return new Promise(async (resolve) => {
    let canStop = await condition();
    const periodic = setInterval(async () => {
      if (canStop) {
        clearInterval(periodic);
        resolve();
      } else {
        canStop = await condition();
      }
    }, periodMs);
  });
}
