import { AfterViewInit, Component, ViewEncapsulation  } from '@angular/core';

@Component({
  selector: 'app-landing-lumo',
  imports: [],
  templateUrl: './landing-lumo.component.html',
  styleUrl: './landing-lumo.component.css',
  encapsulation: ViewEncapsulation.None
})
export default class LandingLumoComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.initScrollAnimations();
    this.initCounters();
    this.initChartBars();
  }

  private initScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    const selectors = [
      '.anim', '.stat-item', '.section-label', '.section-title',
      '.section-sub', '.feature-card', '.testimonial-card',
      '.pricing-card', '.step-item', '.dashboard-mock',
      '.cta-section h2', '.cta-section p', '.cta-btn-wrap'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(el => {
      observer.observe(el);
    });
  }

  private initCounters(): void {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        const counter = entry.target.querySelector('.stat-number') as HTMLElement;

        // ← Solo anima si tiene data-count. Si no, no toca el texto.
        if (counter && counter.dataset['count'] && !counter.dataset['animated']) {
          counter.dataset['animated'] = '1';
          this.animateCount(counter);
        }
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-item').forEach(el => statsObserver.observe(el));
}

  private animateCount(el: HTMLElement): void {
    const target = parseFloat(el.dataset['count'] || '0');
    const prefix = el.dataset['prefix'] || '';
    const suffix = el.dataset['suffix'] || '';
    const isFloat = el.dataset['float'] !== undefined;
    const duration = 1800;
    const start = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = target * ease;

      if (isFloat) {
        el.textContent = prefix + value.toFixed(1) + suffix;
      } else if (target >= 1000000) {
        el.textContent = prefix + (value / 1000000).toFixed(1) + 'M' + suffix;
      } else if (target >= 1000) {
        el.textContent = prefix + Math.round(value / 100) * 100 + suffix;
      } else {
        el.textContent = prefix + Math.round(value) + suffix;
      }

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }

  private initChartBars(): void {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.chart-bar').forEach((bar, i) => {
            setTimeout(() => bar.classList.add('animate'), i * 80);
          });
        }
      });
    }, { threshold: 0.3 });

    const dash = document.querySelector('.dashboard-mock');
    if (dash) chartObserver.observe(dash);
  }
}
