import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CompanySettings,
  CompanySettingsService,
  UpdateCompanySettingsRequest
} from '../../services/Company/company-settings.service';

type ConfigurationScreen = 'company' | 'plan';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
export default class ConfigurationComponent implements OnInit {
  settings: CompanySettings | null = null;
  activeScreen: ConfigurationScreen = 'company';
  loading = true;
  saving = false;
  requestingUpgrade = false;
  errorMessage = '';
  successMessage = '';

  constructor(private readonly companySettingsService: CompanySettingsService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.errorMessage = '';
    this.companySettingsService.getSettings().subscribe({
      next: settings => {
        this.settings = settings;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible cargar la configuración de la empresa.';
        this.loading = false;
      }
    });
  }

  saveCompany(): void {
    if (!this.settings || this.saving) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const request: UpdateCompanySettingsRequest = {
      name: this.settings.name,
      nit: this.settings.nit,
      email: this.settings.email,
      phone: this.settings.phone,
      address: this.settings.address
    };

    this.companySettingsService.updateSettings(request).subscribe({
      next: settings => {
        this.settings = settings;
        this.successMessage = 'La información de la empresa se actualizó correctamente.';
        this.saving = false;
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible actualizar la información de la empresa.';
        this.saving = false;
      }
    });
  }

  requestPlusUpgrade(): void {
    if (!this.settings
      || this.settings.subscriptionPlan !== 'standard'
      || this.settings.upgradeRequestStatus === 'pending'
      || this.requestingUpgrade) return;

    this.requestingUpgrade = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.companySettingsService.requestPlusUpgrade().subscribe({
      next: settings => {
        this.settings = settings;
        this.successMessage = 'La solicitud de mejora fue enviada al creador de la plataforma.';
        this.requestingUpgrade = false;
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible enviar la solicitud de mejora.';
        this.requestingUpgrade = false;
      }
    });
  }
}
