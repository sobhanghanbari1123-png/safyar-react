/* Beautiful inline field-validation message.
   Usage: wrap the field in a div with className `form-group ${err ? 'field-invalid' : ''}`
   and render <FieldError msg={err} /> right under the input. */
export default function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="field-err-msg">
      <span className="fe-icon">!</span>
      <span>{msg}</span>
    </div>
  );
}
