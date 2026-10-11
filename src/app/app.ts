import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Shell } from './core/shell/shell';

@Component({
  imports: [Shell],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
