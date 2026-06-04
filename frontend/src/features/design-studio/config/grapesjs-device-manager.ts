import type { Editor } from 'grapesjs';

export function configureDeviceManager(editor: Editor) {
  const dm = editor.DeviceManager;
  dm.add({ id: 'desktop', name: 'Desktop', width: '' });
  dm.add({ id: 'mobile', name: 'Mobile', width: '390px' });
  editor.setDevice('desktop');
}
