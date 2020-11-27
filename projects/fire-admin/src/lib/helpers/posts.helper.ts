declare var Quill: any;

export function initTextEditor(selector: string, placeholder: string = '') {
  const quill = new Quill(selector, {
    modules: {
      toolbar: {
        container: [
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
        ],
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
