using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace demo.Controllers
{
    [Route("api/[controller]")]
    public class TubeStatusController : Controller
    {
        private static string[] Statuses = new[]
        {
            "Good Service", "Minor Delays", "Severe Delays", "Part Closure", "Planned Closure"
        };

        private static string[] Reasons = new[]
        {
            "leaves on the line", "the wrong sort of snow", "badgers", "a strike", "meh"
        };

        //[ResponseCache(Duration = 60)]
        [HttpGet]
        public IEnumerable<LineStatus> Get()
        {
            var rng = new Random();

            var model = new LineStatus[] {
               new LineStatus { Id = "bakerloo",          Name = "Bakerloo",           ModeName = "tube" },
               new LineStatus { Id = "central",           Name = "Central",            ModeName = "tube" },
               new LineStatus { Id = "circle",            Name = "Circle",             ModeName = "tube" },
               new LineStatus { Id = "district",          Name = "District",           ModeName = "tube" },
               new LineStatus { Id = "hammersmith-city",  Name = "Hammersmith & City", ModeName = "tube" },
               new LineStatus { Id = "jubilee",           Name = "Jubilee",            ModeName = "tube" },
               new LineStatus { Id = "metropolitan",      Name = "Metropolitan",       ModeName = "tube" },
               new LineStatus { Id = "northern",          Name = "Northern",           ModeName = "tube" },
               new LineStatus { Id = "piccadilly",        Name = "Piccadilly",         ModeName = "tube" },
               new LineStatus { Id = "victoria",          Name = "Victoria",           ModeName = "tube" },
               new LineStatus { Id = "waterloo-city",     Name = "Waterloo & City",    ModeName = "tube" },
               new LineStatus { Id = "london-overground", Name = "London Overground",  ModeName = "overground" },
               new LineStatus { Id = "tfl-rail",          Name = "TfL Rail",           ModeName = "tflrail" },
               new LineStatus { Id = "dlr",               Name = "DLR",                ModeName = "dlr" },
               new LineStatus { Id = "tram",              Name = "Tram",               ModeName = "tram" }
            };

            return model.Select(index =>
            {
                var status = Statuses[rng.Next(Statuses.Length)];
                var statusId = 10;
                var reason = "";
                if (status != "Good Service")
                {
                    statusId = 11;
                    reason = index.Name.ToUpper() + ": " + status + " due to " + Reasons[rng.Next(Reasons.Length)];
                }
                index.LineStatuses = new Status[] {
                    new Status{
                        StatusSeverityDescription = status,
                        StatusSeverity = statusId,
                        Reason = reason,
                    }
                };
                return index;
            });
        }

        public class LineStatus
        {
            public string ModeName { get; set; }
            public string Name { get; set; }
            public string Id { get; set; }
            public Status[] LineStatuses { get; set; }
        }

        public class Status
        {
            public int StatusSeverity { get; set; }
            public string StatusSeverityDescription { get; set; }
            public string Reason { get; set; }
        }

    }
}
