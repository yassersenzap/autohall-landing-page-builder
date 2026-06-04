import { ListFieldEditor } from '@/features/editor/components/ListFieldEditor';
import type { ListFieldColumn } from '@/features/editor/components/ListFieldEditor';
import { asObjectList } from '../../lib/list-props';

type InspectorListFieldProps = {
  label: string;
  listKey: string;
  columns: ListFieldColumn[];
  propsJson: Record<string, unknown>;
  maxItems?: number;
  onListChange: (key: string, items: Record<string, unknown>[]) => void;
};

export function InspectorListField({
  label,
  listKey,
  columns,
  propsJson,
  maxItems = 6,
  onListChange,
}: InspectorListFieldProps) {
  return (
    <ListFieldEditor
      label={label}
      columns={columns}
      items={asObjectList(propsJson[listKey])}
      maxItems={maxItems}
      onChange={(items) => onListChange(listKey, items)}
    />
  );
}
