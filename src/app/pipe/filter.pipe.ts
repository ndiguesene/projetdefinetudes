import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any, search: string, nomChamp?: string): any {
    if (!items) {
      return [];
    }
    if (!search) {
      return items;
    }
    search = search.toLowerCase();
    if (nomChamp) {
      return items.filter(it => {
        return it['_source'].visualization[nomChamp].toLowerCase().includes(search);
      });
    } else {
      return items.filter((it) => {
        return it.toLowerCase().includes(search);
      });
    }
  }
}
