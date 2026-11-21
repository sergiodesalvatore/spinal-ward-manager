import { CONSULTANTS, RESIDENTS } from "../../shared/careTeam.js";
const roles = [
  { field: "consultant", label: "Referente", options: CONSULTANTS },
  { field: "resident", label: "Specializzando", options: RESIDENTS },
];
export function PatientTeamFields({ patient, onChange, required = false }) {
  return roles.map(({ field, label, options }) => (
    <label key={field}>
      {label}
      <select
        name={field}
        value={patient[field] || ""}
        onChange={onChange}
        required={required}
      >
        <option value="" disabled>
          Da assegnare
        </option>
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  ));
}
export function PatientTeamBadges({ patient, onChange, disabled = false }) {
  return (
    <div className="patient-team" aria-label="Team del paziente">
      {roles.map(({ field, label, options }) =>
        onChange ? (
          <label key={field} className={`team-badge ${field}`}>
            <span>{label}</span>
            <select
              aria-label={`${label} di ${patient.lastName} ${patient.firstName}`}
              value={patient[field] || ""}
              disabled={disabled}
              onChange={(e) => onChange(field, e.target.value)}
            >
              <option value="" disabled>
                Da assegnare
              </option>
              {options.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span key={field} className={`team-badge ${field}`}>
            <span>{label}</span>
            <strong>{patient[field] || "Da assegnare"}</strong>
          </span>
        ),
      )}
    </div>
  );
}
