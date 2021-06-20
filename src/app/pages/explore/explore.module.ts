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
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { PendingTabComponent } from '@app/pages/explore/account/tabs/pending/pending-tab.component';
import { ConfirmedTabComponent } from '@app/pages/explore/account/tabs/confirmed/confirmed-tab.component';
import { DelegatorsTabComponent } from '@app/pages/explore/account/tabs/delegators/delegators-tab.components';
import { HashComponent } from '@app/pages/explore/hash/hash.component';
import { BookmarkButtonComponent } from '../../components/bookmark-button/bookmark-button.component';
import { CopyButtonComponent } from '../../components/copy-button/copy-button.component';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { InsightsTabComponent } from '@app/pages/explore/account/tabs/insights/insights-tab.components';
import { HighchartsChartModule } from 'highcharts-angular';
import { QrButtonComponent } from '@app/components/qr-button/qr-button.component';
import { QrDialogComponent } from '@app/components/qr-dialog/qr-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ErrorComponent } from '@app/components/error/error.component';

@NgModule({
    declarations: [
        AccountComponent,
        BookmarkButtonComponent,
        CopyButtonComponent,
        QrButtonComponent,
        QrDialogComponent,
        ConfirmedTabComponent,
        DelegatorsTabComponent,
        ExploreComponent,
        HashComponent,
        PendingTabComponent,
        SafeHtmlPipe,
        ResponsiveDirective,
        PaginatorComponent,
        InsightsTabComponent,
        ErrorComponent,
    ],
    entryComponents: [QrDialogComponent],
    imports: [
        CommonModule,
        EmptyStateModule,
        InfoListItemModule,
        ListItemTagModule,
        MatBadgeModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatTableModule,
        ReactiveFormsModule,
        HighchartsChartModule,
    ],
    exports: [
        AccountComponent,
        BookmarkButtonComponent,
        QrButtonComponent,
        CopyButtonComponent,
        ConfirmedTabComponent,
        DelegatorsTabComponent,
        ExploreComponent,
        HashComponent,
        PendingTabComponent,
        SafeHtmlPipe,
        ResponsiveDirective,
        PaginatorComponent,
        ErrorComponent,
    ],
})
export class ExploreModule {}
