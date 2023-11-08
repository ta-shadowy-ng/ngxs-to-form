import { ValidationErrors } from '@angular/forms';

export interface ValidationResult {
  [field: string]: ValidationErrors;
}
