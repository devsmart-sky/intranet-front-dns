import React, { useState, useEffect } from 'react';
import { Gift, X, Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Funcionario } from '../types';

interface BirthdayBannerProps {
  funcionarios: Funcionario[];
  onClose?: () => void;
}

export const BirthdayBanner: React.FC<BirthdayBannerProps> = ({ funcionarios, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // if (funcionarios.length === 0) {
  //   return null;
  // }

  // const today = new Date();
  // const birthdaysToday = funcionarios.filter(emp => {
  //   const birthDate = new Date(emp.birthDate);
  //   return birthDate.getDate() === today.getDate() && 
  //          birthDate.getMonth() === today.getMonth();
  // });

  // const birthdaysThisMonth = funcionarios.filter(emp => {
  //   const birthDate = new Date(emp.birthDate);
  //   return birthDate.getMonth() === today.getMonth();
  // });

  // // Se não há aniversariantes hoje, mostrar os do mês
  // const displayEmployees = birthdaysToday.length > 0 ? birthdaysToday : birthdaysThisMonth;
  // const currentEmployee = displayEmployees[currentIndex];

  // const nextEmployee = () => {
  //   setCurrentIndex((prev) => (prev + 1) % displayEmployees.length);
  // };

  // const prevEmployee = () => {
  //   setCurrentIndex((prev) => (prev - 1 + displayEmployees.length) % displayEmployees.length);
  // };

  // const isToday = (employee: Employee) => {
  //   const birthDate = new Date(employee.birthDate);
  //   return birthDate.getDate() === today.getDate() && 
  //          birthDate.getMonth() === today.getMonth();
  // };

  // return (
  //   <>
  //     {/* Backdrop */}
  //     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
  //       {/* Modal Container */}
  //       <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
  //         {/* Decorative elements */}
  //         <div className="absolute inset-0 opacity-20">
  //           <div className="absolute top-2 left-4 text-3xl animate-bounce">🎈</div>
  //           <div className="absolute top-4 right-8 text-2xl animate-pulse">🎂</div>
  //           <div className="absolute bottom-2 left-8 text-xl animate-bounce delay-300">🎉</div>
  //           <div className="absolute bottom-4 right-4 text-2xl animate-pulse delay-500">🎈</div>
  //           <div className="absolute top-1/2 left-1/4 text-xl animate-bounce delay-700">✨</div>
  //           <div className="absolute top-1/3 right-1/4 text-xl animate-pulse delay-1000">🎊</div>
  //         </div>

  //         {/* Close Button */}
  //         <button
  //           onClick={onClose}
  //           className="absolute top-4 right-4 z-10 text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30"
  //         >
  //           <X className="w-5 h-5" />
  //         </button>

  //         <div className="relative p-6">
  //           {/* Header */}
  //           <div className="text-center mb-6">
  //             <div className="flex items-center justify-center mb-3">
  //               <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
  //                 <Gift className="w-6 h-6 text-white" />
  //               </div>
  //             </div>
  //             <h2 className="text-2xl font-bold text-white mb-1">
  //               🎉 {birthdaysToday.length > 0 ? 'Parabéns!' : 'Aniversariantes do Mês'} 🎉
  //             </h2>
  //             <p className="text-white text-opacity-90 text-sm">
  //               {birthdaysToday.length > 0 
  //                 ? `${birthdaysToday.length} aniversariante${birthdaysToday.length > 1 ? 's' : ''} hoje!`
  //                 : `${birthdaysThisMonth.length} aniversariante${birthdaysThisMonth.length > 1 ? 's' : ''} este mês`
  //               }
  //             </p>
  //           </div>

  //           {/* Employee Card */}
  //           <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-30 mb-4">
  //             <div className="flex flex-col items-center text-center">
  //               <div className="relative mb-4">
  //                 {currentEmployee.photo ? (
  //                   <img 
  //                     src={currentEmployee.photo} 
  //                     alt={currentEmployee.name}
  //                     className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
  //                   />
  //                 ) : (
  //                   <div className="w-20 h-20 bg-white bg-opacity-30 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
  //                     <span className="text-white font-bold text-2xl">
  //                       {currentEmployee.name.charAt(0)}
  //                     </span>
  //                   </div>
  //                 )}
  //                 {isToday(currentEmployee) && (
  //                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center animate-bounce shadow-lg">
  //                     <span className="text-lg">🎂</span>
  //                   </div>
  //                 )}
  //               </div>
                
  //               <h3 className="text-xl font-bold text-white mb-2">
  //                 {currentEmployee.name}
  //               </h3>
                
  //               <div className="flex items-center justify-center space-x-2 mb-3">
  //                 <Calendar className="w-4 h-4 text-white text-opacity-80" />
  //                 <span className="text-white text-opacity-90">
  //                   {new Date(currentEmployee.birthDate).toLocaleDateString('pt-BR', {
  //                     day: '2-digit',
  //                     month: 'long'
  //                   })}
  //                 </span>
  //                 {isToday(currentEmployee) && (
  //                   <span className="px-3 py-1 bg-yellow-300 text-yellow-800 text-sm font-bold rounded-full animate-pulse ml-2">
  //                     HOJE!
  //                   </span>
  //                 )}
  //               </div>

  //               <p className="text-white text-opacity-80 text-sm">
  //                 {isToday(currentEmployee) 
  //                   ? '🎈 Desejamos um dia repleto de alegrias! 🎈'
  //                   : '🎉 Que este novo ano seja incrível! 🎉'
  //                 }
  //               </p>
  //             </div>
  //           </div>

  //           {/* Navigation Controls */}
  //           {displayEmployees.length > 1 && (
  //             <div className="flex items-center justify-between mb-4">
  //               <button
  //                 onClick={prevEmployee}
  //                 className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30"
  //               >
  //                 <ChevronLeft className="w-5 h-5" />
  //               </button>

  //               <div className="flex items-center space-x-2">
  //                 {displayEmployees.map((_, index) => (
  //                   <button
  //                     key={index}
  //                     onClick={() => setCurrentIndex(index)}
  //                     className={`w-3 h-3 rounded-full transition-all duration-200 ${
  //                       index === currentIndex
  //                         ? 'bg-white scale-125'
  //                         : 'bg-white bg-opacity-50 hover:bg-opacity-75'
  //                     }`}
  //                   />
  //                 ))}
  //               </div>

  //               <button
  //                 onClick={nextEmployee}
  //                 className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30"
  //               >
  //                 <ChevronRight className="w-5 h-5" />
  //               </button>
  //             </div>
  //           )}

  //           {/* Footer */}
  //           <div className="text-center">
  //             <p className="text-white text-opacity-90 text-sm flex items-center justify-center">
  //               <Users className="w-4 h-4 mr-2" />
  //               {currentIndex + 1} de {displayEmployees.length} aniversariante{displayEmployees.length > 1 ? 's' : ''}
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </>
  // );
};