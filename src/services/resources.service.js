import casesService from "@/services/cases.service";
import utils from "@/common/utils";

const getSystemTime = (cases) => {
    const casesArray = Array.isArray(cases) ? cases : [cases];
    for (let event of casesArray) {
        if (event.activities && Array.isArray(event.activities) && event.activities.length > 0) {
            for (let activity of event.activities) {
                if (activity.prescriptions && Array.isArray(activity.prescriptions) && activity.prescriptions.length > 0) {
                    console.log("Found system time in prescription:", activity.prescriptions[0].date);
                    return activity.prescriptions[0].date;
                }
            }
        }
    }
    console.error("No valid system time found in cases.");
    return null;
};

const processResourceData = (cases) => {
    const systemTime = getSystemTime(cases);
    if (!systemTime) {
        console.error("System time is not set. Cannot process resource data.");
        return [];
    }

    const systemTimeDate = new Date(systemTime);
    const casesArray = Array.isArray(cases) ? cases : [cases];

    let resources = casesArray.flatMap(event => {
        if (!event.activities || !Array.isArray(event.activities) || event.activities.length === 0) {
            return [];
        }

        const eventSystemTime = new Date(event.activities[0]["time:timestamp"]);

        return event.activities.flatMap(activity => {
            return activity.prescriptions
                .filter(p => p.type === 'RESOURCE_ALLOCATION' && p.output && p.output.allocated_until)
                .map(p => {
                    const currentSystemTime = eventSystemTime;
                    const timeDifference = systemTimeDate - currentSystemTime;

                    const originalAllocatedUntilTime = new Date(p.output.allocated_until);
                    // Adjust allocated_until by subtracting the time difference
                    const adjustedAllocatedUntilTime = new Date(originalAllocatedUntilTime.getTime() - timeDifference);
                    const isBusy = adjustedAllocatedUntilTime > currentSystemTime; // Check if the resource is still allocated

                    return {
                        id: event._id,
                        name: `${p.output.resource}`,
                        role: 'Dynamic Role',
                        status: isBusy ? 'Busy' : 'Available'
                    };
                });
        });
    });

    // Manual update: Set the status of the resource with the same id to 'Busy' if any resources are found
    if (resources.length > 0) {
        let id = resources[0].id;
        resources = resources.map(resource =>
            resource.id === id ? { ...resource, status: 'Busy' } : resource
        );
    }
    return resources;
};

const fetchResourceData = async () => {
    try {
        const response = await casesService.getCasesByLogAndCompletion(utils.getLocal('logId'), 'ongoing');
        if (response.data && Array.isArray(response.data.cases) && response.data.cases.length > 0) {
            return processResourceData(response.data.cases);
        } else {
            console.log("No cases data returned from API");
            return [];
        }
    } catch (error) {
        console.error("Fetching error:", error);
        throw error;
    }
};

const fetchResourceDataByCaseId = async (caseId) => {
    try {
        console.log("Fetching cases with logId:", utils.getLocal('logId'));
        const response = await casesService.getCasesByLogAndCompletion(utils.getLocal('logId'), 'ongoing');
        console.log("Response from API:", response.data);

        if (response.data && Array.isArray(response.data.cases)) {
            console.log("Cases is an array with length:", response.data.cases.length);
            const matchingCase = response.data.cases.find(c => c._id === caseId);

            if (matchingCase) {
                console.log("Case ID matches:", caseId);
                return processResourceData([matchingCase]);
            } else {
                console.log("No matching case ID found. Expected:", caseId);
                return [];
            }
        } else {
            console.log("Cases is not an array or is undefined. Cases:", response.data.cases);
            return [];
        }
    } catch (error) {
        console.error("Fetching error:", error);
        throw error;
    }
};

export default {
    fetchResourceData,
    fetchResourceDataByCaseId
};