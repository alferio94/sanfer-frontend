// src/app/shared/components/reusable-table/reusable-table.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ContentChild,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'custom';
}

export interface TableConfig {
  showPagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showFirstLastButtons?: boolean;
  sortable?: boolean;
  stickyHeader?: boolean;
}

export interface TableAction<T = any> {
  icon: string;
  label: string;
  color?: string;
  disabled?: (item: T) => boolean;
  visible?: (item: T) => boolean;
  handler: (item: T) => void;
}

@Component({
  selector: 'app-reusable-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.scss',
})
export class ReusableTableComponent<T = any> implements OnInit, OnChanges {
  // Data inputs
  @Input({ required: true }) data: T[] = [];
  @Input({ required: true }) columns: TableColumn<T>[] = [];
  @Input() config: TableConfig = {};
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No hay datos disponibles';
  @Input() trackByFn?: (index: number, item: T) => any;

  // Actions
  @Input() actions: TableAction<T>[] = [];
  @Input() bulkActions: TableAction<T[]>[] = [];
  @Input() showSelection = false;

  // Templates for custom content
  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<any>;
  @ContentChild('actionsTemplate') actionsTemplate?: TemplateRef<any>;
  @ContentChild('emptyTemplate') emptyTemplate?: TemplateRef<any>;

  // Events
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() rowClick = new EventEmitter<T>();

  // Internal state
  displayedColumns: string[] = [];
  sortedData: T[] = [];
  paginatedData: T[] = [];
  selectedItems: T[] = [];

  // Pagination
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  // Default config
  private defaultConfig: Required<TableConfig> = {
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showFirstLastButtons: true,
    sortable: true,
    stickyHeader: false,
  };

  ngOnInit(): void {
    this.setupTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns'] || changes['config']) {
      this.setupTable();
    }
  }

  private setupTable(): void {
    // Merge config with defaults
    this.config = { ...this.defaultConfig, ...this.config };
    this.pageSize = this.config.pageSize!;

    // Setup columns
    this.setupColumns();

    // Process data
    this.processData();
  }

  private setupColumns(): void {
    this.displayedColumns = [];

    // Add selection column if enabled
    if (this.showSelection) {
      this.displayedColumns.push('select');
    }

    // Add data columns
    this.displayedColumns.push(...this.columns.map((col) => col.key));

    // Add actions column if there are actions
    if (this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }
  }

  private processData(): void {
    this.totalItems = this.data.length;
    this.sortedData = [...this.data];
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    if (!this.config.showPagination) {
      this.paginatedData = this.sortedData;
      return;
    }

    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.sortedData.slice(startIndex, endIndex);
  }

  // Event handlers
  onSortChange(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.sortedData = [...this.data];
    } else {
      this.sortedData = this.sortData(sort);
    }

    this.pageIndex = 0; // Reset to first page after sorting
    this.updatePaginatedData();
    this.sortChange.emit(sort);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
    this.pageChange.emit(event);
  }

  onRowClick(item: T): void {
    this.rowClick.emit(item);
  }

  onSelectionToggle(item: T): void {
    const index = this.selectedItems.findIndex(
      (selected) =>
        this.getTrackByValue(selected) === this.getTrackByValue(item),
    );

    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }

    this.selectionChange.emit([...this.selectedItems]);
  }

  onSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.paginatedData];
    }
    this.selectionChange.emit([...this.selectedItems]);
  }

  // Helper methods
  isAllSelected(): boolean {
    return this.selectedItems.length === this.paginatedData.length;
  }

  isSelected(item: T): boolean {
    return this.selectedItems.some(
      (selected) =>
        this.getTrackByValue(selected) === this.getTrackByValue(item),
    );
  }

  private getTrackByValue(item: T): any {
    return this.trackByFn ? this.trackByFn(0, item) : item;
  }

  private sortData(sort: Sort): T[] {
    const data = [...this.data];

    return data.sort((a, b) => {
      const aValue = this.getNestedProperty(a, sort.active);
      const bValue = this.getNestedProperty(b, sort.active);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  getCellValue(item: T, column: TableColumn<T>): any {
    return this.getNestedProperty(item, column.key);
  }

  getColumnClass(column: TableColumn<T>): string {
    const classes = [`column-${column.key}`];

    if (column.align) {
      classes.push(`text-${column.align}`);
    }

    if (column.width) {
      classes.push('fixed-width');
    }

    return classes.join(' ');
  }

  // Action methods
  executeAction(action: TableAction<T>, item: T): void {
    if (!action.disabled?.(item)) {
      action.handler(item);
    }
  }

  isActionVisible(action: TableAction<T>, item: T): boolean {
    return action.visible ? action.visible(item) : true;
  }

  isActionDisabled(action: TableAction<T>, item: T): boolean {
    return action.disabled ? action.disabled(item) : false;
  }
}
