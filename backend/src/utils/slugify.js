export default function slugify(text) {
    return text
        .normalize("NFD")                 // separa letras y tildes
        .replace(/[\u0300-\u036f]/g, "")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/&/g, "-and-")
        .replace(/[^\w\-]+/g, "")
        .replace(/--+/g, "-");
}
