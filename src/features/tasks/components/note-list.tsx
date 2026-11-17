type Note = { id: string; content: string; createdAt: Date; author: { name: string } };

const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted">Nenhuma observação ainda.</p>;
  }

  return (
    <ol className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-md border border-border bg-background p-3">
          <p className="text-xs text-muted">
            <span className="font-medium text-foreground">{note.author.name}</span> · {dateTime.format(note.createdAt)}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{note.content}</p>
        </li>
      ))}
    </ol>
  );
}
