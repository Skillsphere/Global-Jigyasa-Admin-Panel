declare var Quill: any;

export function initTextEditor(selector: string, placeholder: string = '') {
  const quill = new Quill(selector, {
    modules: {
      toolbar: {
        container: [],
        handlers: {
          'html': () => { }
        }
      }
    },
    placeholder: placeholder,
    theme: "snow"
  });

  return quill;
}
