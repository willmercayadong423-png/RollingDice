import {
  Component,
  NgZone,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular';

import { Motion } from '@capacitor/motion';
import type { PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
  ]
})
export class HomePage implements OnDestroy {

  number = 1;

  private listener?: PluginListenerHandle;

  private lastX = 0;
  private firstReading = true;
  private lastShake = 0;

  private readonly SHAKE_THRESHOLD = 2.0;
  private readonly SHAKE_COOLDOWN = 1000;

  constructor(
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ionViewDidEnter() {
    this.startMotion();
  }

  async startMotion() {

    if (this.listener) {
      return;
    }

    try {

      this.listener = await Motion.addListener('accel', (event) => {

        const acceleration = event.accelerationIncludingGravity;

        if (!acceleration) {
          return;
        }

        const x = acceleration.x ?? 0;

        if (this.firstReading) {
          this.lastX = x;
          this.firstReading = false;
          return;
        }

        const movement = Math.abs(x - this.lastX);

        const now = Date.now();

        if (
          movement >= this.SHAKE_THRESHOLD &&
          now - this.lastShake >= this.SHAKE_COOLDOWN
        ) {

          this.lastShake = now;

          this.zone.run(() => {
            this.number = Math.floor(Math.random() * 6) + 1;
            this.cdr.detectChanges();
          });

        }

        this.lastX = x;

      });

    } catch (error) {
      console.error(error);
    }
  }

  onTapRoll() {
    this.number = Math.floor(Math.random() * 6) + 1;
    this.cdr.detectChanges();
  }

  async ngOnDestroy() {

    if (this.listener) {
      await this.listener.remove();
      this.listener = undefined;
    }

  }
}