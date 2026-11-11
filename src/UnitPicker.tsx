import { curriculumUnits, materialLabelsById, type Level } from './data/curriculum'

const LEVELS: readonly Level[] = ['A', 'B', 'C']

export function UnitPicker({ selectedIds, masteredIds, onToggle }: { selectedIds: readonly string[]; masteredIds?: ReadonlySet<string>; onToggle: (id: string) => void }) {
  return (
    <>
      {LEVELS.map((level) => (
        <div className="unit-group" key={level}>
          <div className="unit-group-heading"><span>Level {level}</span></div>
          <div className="unit-options">
            {curriculumUnits.filter((unit) => unit.level === level).map((unit) => {
              const checked = selectedIds.includes(unit.id)
              const mastered = masteredIds?.has(unit.id) ?? false
              return (
                <label className={`unit-option ${checked ? 'is-selected' : ''} ${mastered ? 'is-mastered' : ''}`} key={unit.id}>
                  <span className="unit-selection">
                    <input type="checkbox" checked={checked} disabled={mastered} onChange={() => onToggle(unit.id)} />
                    <span className="custom-check" aria-hidden="true" />
                    <span className="unit-copy"><strong>{materialLabelsById[unit.id] ?? unit.title}</strong><small><span lang="fr">{unit.title}</span> · {unit.id.toUpperCase()}{mastered ? ' · Mastered' : ''}</small></span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
