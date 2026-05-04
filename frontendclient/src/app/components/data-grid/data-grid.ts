import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GridColumn {
  field: string;
  header: string;
  type?: 'text' | 'date' | 'number' | 'boolean';
}

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-grid.html',
  styleUrl: './data-grid.css'
})
export class DataGrid {
  @Input() columns: GridColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
  
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

  getFieldValue(item: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], item);
  }

  getDisplayValue(item: any, column: GridColumn): string {
    const value = this.getFieldValue(item, column.field);

    if (column.type === 'boolean' || typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  }
}
