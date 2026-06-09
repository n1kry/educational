import Quill from 'quill';

const FontAttributor = Quill.import('formats/font') as any;
FontAttributor.whitelist = ['sans-serif', 'serif', 'monospace', 'arial', 'times-new-roman', 'courier-new'];
Quill.register(FontAttributor, true);

export const QUILL_MODULES = {
  toolbar: [
    [{ font: ['sans-serif', 'serif', 'monospace', 'arial', 'times-new-roman', 'courier-new'] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ]
};
