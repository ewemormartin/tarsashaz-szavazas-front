import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'meetingfilter',
  standalone: true,
  pure: false
})
export class MeetingfilterPipe implements PipeTransform {

  transform(meetings: any[], filters: any): any[] {
    if (!meetings || !filters) return meetings;
    return meetings.filter((m: any) => {
      return Object.keys(filters).every((f: any) => {
        const filterValue = filters[f];
        const meetingValue = m[f];
        if (filterValue === null || filterValue === undefined || filterValue === '') {
          return true;
        }
        if(typeof meetingValue === 'string') {
          return meetingValue.toLowerCase().includes(filterValue.toLowerCase());
        }
        if(typeof meetingValue === 'number') {
          return meetingValue.toString().includes(filterValue.toString());
        }
        return true;
      });
    });
  }
}
