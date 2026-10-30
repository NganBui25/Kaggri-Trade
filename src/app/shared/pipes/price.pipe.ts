import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {
  transform(value: number | string | null | undefined, unitSuffix: string = '₫'): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0 ' + unitSuffix;
    }
    const num = Math.round(Number(value));
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return unitSuffix ? `${formatted} ${unitSuffix}` : formatted;
  }
}

@Pipe({
  name: 'numberDot',
  standalone: true
})
export class NumberDotPipe implements PipeTransform {
  transform(value: number | string | null | undefined, unit: string = ''): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0' + (unit ? ` ${unit}` : '');
    }
    const num = Number(value);
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return unit ? `${formatted} ${unit}` : formatted;
  }
}

