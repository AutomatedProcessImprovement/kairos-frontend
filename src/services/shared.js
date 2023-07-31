
export default{

    evaluationMethods: {
      'TEXT': {operators:{'EQUAL':'Text equals','NOT_EQUAL':'Text does not equal','CONTAINS':'Text contains','NOT_CONTAINS':'Text does not contain'},inputType:'text'},
      'NUMBER': {operators:{'EQUAL':'Number equals','NOT_EQUAL':'Number does not equal','GREATER_THAN':'Number is greater than','LESS_THAN':'Number is less than','GREATER_THAN_OR_EQUAL':'Number is greater than or equal to','LESS_THAN_OR_EQUAL':'Number is less than or equal to'},
                inputType:'number'},
      'BOOLEAN': {operators:{'IS_TRUE':'Is true','IS_FALSE':'Is false'},inputType:'boolean'},
      'DATETIME': {operators:{'EQUAL':'Time equals','NOT_EQUAL':'Time does not equal','LATER_THAN':'Time is later than','EARLIER_THAN':'Time is earlier than','LATER_THAN_OR_EQUAL':'Time is later than or equal','EARLIER_THAN_OR_EQUAL':'Time is earlier than or equal'},
                  inputType:'datetime-local'},
      'ACTIVITY': {operators:{'EQUAL':'Perform','NOT_EQUAL':'Do not perform','CONTAINS':'Perform activity that contains','NOT_CONTAINS': 'Perform activity that does not contain'},inputType:'activity'},
      'RESOURCE': {operators:{'EQUAL':'Resource is','NOT_EQUAL':'Resource is not','CONTAINS':'Resource contains','NOT_CONTAINS':'Resource does not contain'},inputType:'text'},
      'TIMESTAMP': {operators:{'EQUAL':'Perform activity at','NOT_EQUAL':'Do not perform activity at','LATER_THAN':'Perform activity later than','EARLIER_THAN':'Perform activity earlier than','LATER_THAN_OR_EQUAL':'Perform activity later than or at','EARLIER_THAN_OR_EQUAL':'Perform activity earlier than or at'},
                    inputType:'datetime-local'},
      'START_TIMESTAMP': {operators:{'EQUAL':'Start activity at','NOT_EQUAL':'Do not start at','LATER_THAN':'Start later than','EARLIER_THAN':'Start earlier than','LATER_THAN_OR_EQUAL':'Start later than or at','EARLIER_THAN_OR_EQUAL':'Start earlier than or at'},
                          inputType:'datetime-local'},
      'END_TIMESTAMP': {operators:{'EQUAL':'End activity at','NOT_EQUAL':'Do not end at','LATER_THAN':'End later than','EARLIER_THAN':'End earlier than','LATER_THAN_OR_EQUAL':'End later than or at','EARLIER_THAN_OR_EQUAL':'End earlier than or at'},
                        inputType:'datetime-local'},
      'DURATION': {operators:{'EQUAL':'Duration equals','NOT_EQUAL':'Duration does not equal','GREATER_THAN':'Duration is greater than','LESS_THAN':'Duration is less than','GREATER_THAN_OR_EQUAL':'Duration is greater than or equal','LESS_THAN_OR_EQUAL':'Duration is less than or equal'},
                  inputType:'number'},
      'COST': {operators:{'EQUAL':'Cost equals','NOT_EQUAL':'Cost does not equal','GREATER_THAN':'Cost is greater than','LESS_THAN':'Cost is less than','GREATER_THAN_OR_EQUAL':'Cost is greater than or equal','LESS_THAN_OR_EQUAL':'Cost is less than or equal'},
              inputType:'number'},
    },

    operatorEvaluationMethods: {
      'EQUAL': (x,y) => x == y,'NOT_EQUAL':(x,y) => x!=y,'CONTAINS': (x,y) => x.includes(y),'NOT_CONTAINS':(x,y) => !x.includes(y),
      'GREATER_THAN':(x,y) => x > y,'LESS_THAN':(x,y) => x < y,'GREATER_THAN_OR_EQUAL':(x,y) => x >= y,'LESS_THAN_OR_EQUAL':(x,y) => x <= y,
      'IS_TRUE':(x,) => x == true,'IS_FALSE':(x,) => x == false,
      'LATER_THAN': (x,y) => x > y,'EARLIER_THAN': (x,y) => x < y,'LATER_THAN_OR_EQUAL': (x,y) => x >= y,'EARLIER_THAN_OR_EQUAL': (x,y) => x <= y,
      },

    parseDuration(duration){
        const units = { weeks:604800,days:86400,hours:3600, minutes:60,seconds:1};
        return (units[duration.unit] || NaN) * parseInt(duration.value);
      },

    formatIntervention(prescription,columnsDefinition){
        let columnType = columnsDefinition[prescription.treatment[0][0].column];
        let recommendationAttr = this.evaluationMethods[columnType].operators[prescription.treatment[0][0].operator] + ' ' + prescription.treatment[0][0].value;
        return recommendationAttr;
    },

    groupByAndCount(xs, key, condition = false,conditionValue = false) {
      if(condition && conditionValue) xs = xs.filter(x => x[condition] === conditionValue);
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
      const itemStr = localStorage.getItem(key);

      if (!itemStr) {
        return null;
      }
      var item;
      try{
        item = JSON.parse(itemStr);
      }catch(SyntaxError){
        return null;
      }
      const now = new Date()
      if (now.getTime() > item.expiry) {

        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    },

    removeLocal(key){
      const itemStr = localStorage.getItem(key)

      if (itemStr) {
        localStorage.removeItem(key)
      }
      
    },

    capitalise(str){
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    format(s){
      return s.replace(/\s+/g, '_').toUpperCase();
    },

    deformat(s){
      return s.replace(/_+/g, ' ').toLowerCase();
    },


    formatCase(singleCase){
        
        let caseActivities = singleCase.activities;
        let intervened = "No";
        let performance, outcome;
        if(singleCase.case_performance){
          performance = {value:singleCase.case_performance.value,unit:singleCase.case_performance.unit};
          outcome = singleCase.case_performance.outcome
        } else{
          performance = {value: null,unit:null};
          outcome = null
        }

        caseActivities.forEach(activity => {
          if(activity.prescriptions){
            activity.prescriptions.forEach(prescription => {
              if (prescription.status === 'accepted'){
                intervened = "Yes";
                return;
              }
            })
          }
        });
        let data = {
          id: singleCase._id, 
          recommendations: caseActivities[caseActivities.length-1].prescriptions.length,
          intervened: intervened,
          performance: performance, 
          outcome: outcome,
          completed: singleCase.case_completed,
          filters: []
        }
        
        Object.keys(singleCase.case_attributes).forEach(k => {
          data[k] = singleCase.case_attributes[k];
        })

        return data;
    },
}