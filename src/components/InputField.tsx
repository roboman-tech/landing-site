type InputFieldProps = {
  id: string;
  label: string;
  type?: string;
  name?: string;
  textarea?: boolean;
};

export default function InputField({ id, label, type = "text", name, textarea = false }: InputFieldProps) {
  const sharedClassName =
    "w-full rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-300/60";

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      {textarea ? (
        <textarea className={sharedClassName} id={id} name={name ?? id} required rows={6} />
      ) : (
        <input className={sharedClassName} id={id} name={name ?? id} required type={type} />
      )}
    </div>
  );
}
