// Mostrado uma única vez, logo depois de criar a pessoa ou redefinir a senha.
export function TemporaryPasswordNotice({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
      <p className="font-medium">Acesso de {name} pronto.</p>
      <p className="mt-2">Passe estes dados para a pessoa. A senha não será mostrada de novo.</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-green-800">E-mail:</dt>
        <dd className="font-mono">{email}</dd>
        <dt className="text-green-800">Senha provisória:</dt>
        <dd className="font-mono text-base font-semibold tracking-wide">{password}</dd>
      </dl>
      <p className="mt-3 text-green-800">No primeiro acesso, o sistema pede para criar uma senha nova.</p>
    </div>
  );
}
