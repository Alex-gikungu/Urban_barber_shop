// import React from 'react';

// const AppointmentList = ({ appointments, onCancel }) => {
//   return (
//     <div className="mt-10 w-full md:w-2/3">
//       <h2 className="text-2xl font-semibold mb-6 text-white">Your Appointments</h2>

//       {appointments.length === 0 ? (
//         <p className="text-gray-400 bg-gray-800 p-4 rounded-lg shadow">
//           You have no appointments scheduled.
//         </p>
//       ) : (
//         <ul className="space-y-4">
//           {appointments.map((appt) => {
//             const formattedDate = appt.date
//               ? new Date(appt.date).toLocaleDateString('en-US', {
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric',
//                 })
//               : 'N/A';
//             const formattedTime = appt.date
//               ? new Date(appt.date).toLocaleTimeString('en-US', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })
//               : 'N/A';

//             return (
//               <li
//                 key={appt.id}
//                 className="bg-gray-800 text-white p-5 rounded-lg flex flex-col md:flex-row md:justify-between items-start md:items-center transition-all hover:shadow-lg"
//               >
//                 <div className="mb-2 md:mb-0">
//                   <p className="font-semibold">
//                     <span className="text-blue-400">Service:</span> {appt.service}
//                   </p>
//                   <p>
//                     <span className="text-blue-400">Barber:</span> {appt.barber?.full_name || 'N/A'}
//                   </p>
//                   <p>
//                     <span className="text-blue-400">Date:</span> {formattedDate}
//                   </p>
//                   <p>
//                     <span className="text-blue-400">Time:</span> {formattedTime}
//                   </p>
//                   <p>
//                     <span className="text-blue-400">Status:</span> {appt.status || 'Pending'}
//                   </p>
//                   {appt.notes && (
//                     <p>
//                       <span className="text-blue-400">Notes:</span> {appt.notes}
//                     </p>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => onCancel(appt.id)}
//                   className="mt-3 md:mt-0 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow-md transition-transform hover:scale-105"
//                 >
//                   Cancel
//                 </button>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default AppointmentList;