const COVER_IMAGE =
    "https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&auto=format&fit=crop&w=2710&q=80";

export function Banner() {
    return (
        <section className="relative h-40 shrink-0 overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${COVER_IMAGE}')` }}
            />
            <span aria-hidden className="absolute inset-0 bg-black/40" />
        </section>
    );
}