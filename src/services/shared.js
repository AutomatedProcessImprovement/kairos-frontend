export default{
    typeGuide: {
        'TEXT': {'EQUAL':'Text equals','NOT_EQUAL':'Text does not equal','CONTAINS':'Text contains','NOT_CONTAINS':'Text does not contain'},
        'NUMBER': {'EQUAL':'Number equals','NOT_EQUAL':'Number does not equal','GREATER_THAN':'Number is greater than','LESS_THAN':'Number is less than','GREATER_THAN_OR_EQUAL':'Number is greater than or equal to','LESS_THAN_OR_EQUAL':'Number is less than or equal to'},
        'BOOLEAN': {'IS_TRUE':'Is true','IS_FALSE':'Is false'},
        'DATETIME': {'EQUAL':'Time equals','NOT_EQUAL':'Time does not equal','LATER_THAN':'Time is later than','EARLIER_THAN':'Time is earlier than','LATER_THAN_OR_EQUAL':'Time is later than or equal','EARLIER_THAN_OR_EQUAL':'Time is earlier than or equal'},
        'ACTIVITY': {'EQUAL':'Perform','NOT_EQUAL':'Do not perform','CONTAINS':'Perform activity that contains','NOT_CONTAINS': 'Perform activity that does not contain'},
        'RESOURCE': {'EQUAL':'Resource is','NOT_EQUAL':'Resource is not','CONTAINS':'Resource contains','NOT_CONTAINS':'Resource does not contain'},
        'TIMESTAMP': {'EQUAL':'Perform activity at','NOT_EQUAL':'Do not perform activity at','LATER_THAN':'Perform activity later than','EARLIER_THAN':'Perform activity earlier than','LATER_THAN_OR_EQUAL':'Perform activity later than or at','EARLIER_THAN_OR_EQUAL':'Perform activity earlier than or at'},
        'START_TIMESTAMP': {'EQUAL':'Start activity at','NOT_EQUAL':'Do not start at','LATER_THAN':'Start later than','EARLIER_THAN':'Start earlier than','LATER_THAN_OR_EQUAL':'Start later than or at','EARLIER_THAN_OR_EQUAL':'Start earlier than or at'},
        'END_TIMESTAMP': {'EQUAL':'End activity at','NOT_EQUAL':'Do not end at','LATER_THAN':'End later than','EARLIER_THAN':'End earlier than','LATER_THAN_OR_EQUAL':'End later than or at','EARLIER_THAN_OR_EQUAL':'End earlier than or at'},
        'DURATION': {'EQUAL':'Duration equals','NOT_EQUAL':'Duration does not equal','GREATER_THAN':'Duration is greater than','LESS_THAN':'Duration is less than','GREATER_THAN_OR_EQUAL':'Duration is greater than or equal','LESS_THAN_OR_EQUAL':'Duration is less than or equal'},
        'COST': {'EQUAL':'Cost equals','NOT_EQUAL':'Cost does not equal','GREATER_THAN':'Cost is greater than','LESS_THAN':'Cost is less than','GREATER_THAN_OR_EQUAL':'Cost is greater than or equal','LESS_THAN_OR_EQUAL':'Cost is less than or equal'},
    },

    parseDuration(duration){
        const units = { weeks:604800,days:86400,hours:3600, minutes:60,seconds:1};
        return (units[duration.unit] || NaN) * parseInt(duration.value);
      },

    formatIntervention(prescription,columnsDefinition){
        let columnType = columnsDefinition[prescription.treatment[0][0].column];
        let recommendationAttr = this.typeGuide[columnType][prescription.treatment[0][0].operator] + ' ' + prescription.treatment[0][0].value;
        return recommendationAttr;
    },

    groupByAndCount(xs, key, condition) {
      xs = xs.filter(x => x[condition] === 'Yes');
        return xs.reduce((acc, x) => {
          const value = x[key]
          if (!acc[value]) {
            acc[value] = 0;
          }
          acc[value]++;
          return acc;
        }, {});
      },

    setLocal(key, value, ttl = 1) {
        ttl = ttl * 86400000;
        const now = new Date()
        
        const item = {
          value: value,
          expiry: now.getTime() + ttl,
        }
        localStorage.setItem(key, JSON.stringify(item))
      },
    
    getLocal(key){
      const itemStr = localStorage.getItem(key)

      if (!itemStr) {
        return null
      }
      const item = JSON.parse(itemStr)
      const now = new Date()
      if (now.getTime() > item.expiry) {

        localStorage.removeItem(key)
        return null
      }
      return item.value
    }
}