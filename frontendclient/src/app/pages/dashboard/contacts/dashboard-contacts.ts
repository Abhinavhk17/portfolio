import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid, GridColumn } from '../../../components/data-grid/data-grid';
import { ContactsService } from '../../../api/generated/contacts/contacts.service';
import { Contact } from '../../../api/models';

@Component({
  selector: 'app-dashboard-contacts',
  standalone: true,
  imports: [CommonModule, DataGrid],
  templateUrl: './dashboard-contacts.html'
})
export class DashboardContacts implements OnInit {
  contacts: Contact[] = [];
  loadingContacts = false;

  contactColumns: GridColumn[] = [
    { field: 'fullName', header: 'Full Name' },
    { field: 'email', header: 'Email' },
    { field: 'howCanIHelp', header: 'Message' },
    { field: 'createdAt', header: 'Date Submitted' }
  ];

  constructor(private contactsService: ContactsService) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.loadingContacts = true;
    this.contactsService
      .getAllContacts()
      .then((data: any) => {
        this.contacts = data;
        this.loadingContacts = false;
      })
      .catch((error: any) => {
        console.error('Error loading contacts:', error);
        this.loadingContacts = false;
      });
  }
}
