export interface ErrorStrings {
  title: string;
  message: string;
}
export function displayError(error: ErrorStrings) {

  document.body.classList.remove("configurable-application--loading");
  document.body.classList.add("app-error");
  document.getElementById("appMain").innerHTML = `<h1>${error.title}</h1><p class='app-error-content'>${error.message}</p>`;

}
