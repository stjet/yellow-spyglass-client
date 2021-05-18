import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

//pxblue modules
import { EmptyStateModule, InfoListItemModule, ListItemTagModule } from '@pxblue/angular-components';

//material modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

// app
import { AccountComponent } from './account/account.component';
import { ExploreComponent } from './explore.component';
import { SafeHtmlPipe } from '../../pipes/safe.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { ResponsiveDirective } from '../../directives/responsive.directive';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntlCustom } from '../../services/material/mat-paginator-itl.service';
import {MatTableModule} from "@angular/material/table";

@NgModule({
    declarations: [AccountComponent, ExploreComponent, SafeHtmlPipe, ResponsiveDirective],
    imports: [
        CommonModule,
        EmptyStateModule,
        InfoListItemModule,
        ListItemTagModule,
        MatBadgeModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatTableModule,
        ReactiveFormsModule,
    ],
    providers: [
        {
            provide: MatPaginatorIntl,
            useClass: MatPaginatorIntlCustom,
        },
    ],
    exports: [AccountComponent, ExploreComponent, SafeHtmlPipe, ResponsiveDirective],
})
export class ExploreModule {}
