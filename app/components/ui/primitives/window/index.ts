import { WindowFrame, ResizeHandle } from './Frame';
import { WindowTitleBar } from './TitleBar';
import { WindowButton } from './Controls';
import { WindowLayout } from '../../../system/window/WindowLayout';

export const Window = {
  Frame: WindowFrame,
  TitleBar: WindowTitleBar,
  Controls: WindowButton,
  ResizeHandle: ResizeHandle,
  Layout: WindowLayout,
};

export { WindowFrame, ResizeHandle, WindowTitleBar, WindowButton }; 
