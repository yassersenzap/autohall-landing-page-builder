import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/shadcn/drawer';
import { V4InspectorContent } from './inspector/V4InspectorContent';

type V4InspectorDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function V4InspectorDrawer({ open, onOpenChange }: V4InspectorDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal={false} direction="right">
      <DrawerContent className="v4-inspector-drawer" data-testid="inspector-drawer">
        <DrawerHeader>
          <DrawerTitle>Inspector</DrawerTitle>
          <DrawerDescription className="sr-only">Propriétés du node sélectionné</DrawerDescription>
        </DrawerHeader>
        <div className="v4-inspector-drawer__body" data-testid="inspector-panel">
          <V4InspectorContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
