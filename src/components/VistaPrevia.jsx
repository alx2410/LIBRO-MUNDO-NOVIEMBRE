export default function VistaPrevia({ titulo, genero, portada, contenido }) {
  return (
    <div className="mt-8 p-4 border-t pt-6">
      <h3 className="text-2xl font-semibold mb-3">👁 Vista previa</h3>

      {portada && (
        <img
          src={portada}
          alt="Portada"
          className="w-48 h-64 object-cover rounded-lg mb-4"
        />
      )}

      <h4 className="text-xl font-bold">{titulo || "Sin título"}</h4>
      <p className="italic text-gray-600 mb-2">
        {genero || "Género no especificado"}
      </p>

      <p className="whitespace-pre-line leading-relaxed">{contenido}</p>
    </div>
  );
}
