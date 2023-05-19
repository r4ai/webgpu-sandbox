export function handle_error(init: Function) {
  try {
    init();
  } catch (error) {
    alert(error);
  }
}
