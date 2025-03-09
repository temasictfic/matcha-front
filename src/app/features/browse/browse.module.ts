import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowseComponent } from './pages/browse/browse.component';
import { ProfileDetailComponent } from './pages/profile-detail/profile-detail.component';
import { MatchesComponent } from './pages/matches/matches.component';
import { FiltersComponent } from './components/filters/filters.component';

const routes: Routes = [
  { path: '', component: BrowseComponent },
  { path: 'matches', component: MatchesComponent },
  { path: 'profile/:id', component: ProfileDetailComponent }
];

@NgModule({
  declarations: [
    BrowseComponent,
    ProfileDetailComponent,
    MatchesComponent,
    FiltersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    RouterModule.forChild(routes)
  ]
})
export class BrowseModule { }