import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthProvider';
import { fetchStudentProfile, updateProfile } from '../../services/studentService.js';
import userr from '../../assets/user.png';




const Settings = () => {
    const [isOpenRoom, setIsOpenRoom] = useState(false);
    const [isOpenProfile, setIsOpenProfile] = useState(false);
    const [student, setStudent] = useState(null);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    let userId = user?._id;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        hostel: "",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newProfile = await updateProfile(userId, formData);
        userId = null;
        userId = newProfile.userId;
        console.log("new userId is: ", userId);
        alert("Profile updated successfully!");
        setIsOpenProfile(false);
        window.location.reload();
    };

    useEffect(() => {
        if (userId) {
            fetchStudentProfile(userId).then((data) => {
                if (data.error) {
                    setError(data.message)
                } else {
                    setStudent(data)
                }
            })
        }
    }, [userId])

    console.log("student is: " ,student);

    if (error) {
        return (
            <div className="text-red-500 text-center mt-10">
                <p>Error: {error}</p>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="text-center mt-10">
                <p>Loading data...</p>
            </div>
        )
    }
    const getFormattedDate = () => {
        const date = new Date();
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "long" });
        const year = date.getFullYear();

        const getOrdinalSuffix = (day) => {
            if (day > 3 && day < 21) return "th";
            switch (day % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
    };

    return (
        <div className='bg-gray-100 fixed h-screen w-screen'>
            <div className='absolute top-[40px] left-[2%] flex items-center justify-between w-[80vw] [@media(max-width:900px)]:hidden'>
                <div className='flex flex-col'>
                    <p className='text-2xl font-bold text-black'>Settings</p>
                    <p className='text-sm text-neutral-600'>{getFormattedDate()}</p>
                </div>
                <div className='flex items-center justify-center gap-15'>
                    <div className='bg-white flex items-center justify-center gap-3 !p-2 rounded-lg'>
                        <div className=''>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 18.6667H14.0105" stroke="#FF0000" stroke-width="2.33333" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M14 15.1666V9.33331" stroke="#FF0000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M17.6782 4.99804C16.3086 4.48977 15.7006 2.4555 14.1397 2.33853C14.0469 2.33157 13.9536 2.33157 13.8609 2.33853C12.3 2.45551 11.6919 4.48965 10.3224 4.99804C8.87221 5.53609 6.88933 4.43317 5.66142 5.6611C4.47953 6.84297 5.5254 8.90156 4.99836 10.322C4.45957 11.7734 2.20648 12.3738 2.33885 14.1394C2.45582 15.7003 4.49009 16.3083 4.99836 17.6779C5.52543 19.0983 4.47947 21.157 5.66142 22.3388C6.88915 23.5668 8.87216 22.4643 10.3224 23.0019C11.6916 23.5109 12.3002 25.5446 13.8609 25.6614C13.9536 25.6684 14.0469 25.6684 14.1397 25.6614C15.7003 25.5446 16.3091 23.5108 17.6782 23.0019C19.0987 22.4752 21.1575 23.5208 22.3391 22.3388C23.6077 21.0706 22.3855 19.0144 23.0556 17.549C23.675 16.1997 25.7906 15.5679 25.6617 13.8606C25.5449 12.2999 23.5112 11.6911 23.0022 10.322C22.4646 8.87184 23.5671 6.88883 22.3391 5.6611C21.1113 4.43311 19.1284 5.53613 17.6782 4.99804Z" stroke="#FF0000" stroke-width="1.75" />
                            </svg>
                        </div>
                        <p className='text-[#FF0000]'> Alert </p>
                    </div>
                    <div className='flex items-center justify-center gap-1'>
                        <div>
                            <img src={student.imageURL != undefined ? student.imageURL : userr} className='w-12 h-12 rounded-full' alt="userImg" />
                        </div>
                        <p className='!px-2 font-semibold'>{student.userId.name}</p>

                    </div>
                </div>
            </div>

            <div className='absolute left-[5%] top-[140px] bg-white flex flex-col gap-5 !p-3 w-[35%] h-[65%] rounded-2xl'>
                <div className='flex items-center gap-7 justify-start '>
                    <svg width="40" height="44" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.6666 40.2427C21.1184 40.3027 20.5624 40.3333 19.9999 40.3333C10.7952 40.3333 3.33325 32.1251 3.33325 22C3.33325 11.8747 10.7952 3.66663 19.9999 3.66663C29.2046 3.66663 36.6666 11.8747 36.6666 22C36.6666 22.6187 36.6388 23.2303 36.5843 23.8333" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M12.5 31.1667C14.8374 28.4737 18.3687 27.3242 21.6667 27.8559M24.1585 17.4167C24.1585 19.948 22.2903 22 19.9858 22C17.6815 22 15.8133 19.948 15.8133 17.4167C15.8133 14.8854 17.6815 12.8334 19.9858 12.8334C22.2903 12.8334 24.1585 14.8854 24.1585 17.4167Z" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M30.8333 40.3333C34.055 40.3333 36.6667 37.4605 36.6667 33.9167C36.6667 30.3728 34.055 27.5 30.8333 27.5C27.6117 27.5 25 30.3728 25 33.9167C25 37.4605 27.6117 40.3333 30.8333 40.3333Z" stroke="black" stroke-width="1.5" />
                    </svg>
                    <p>Your profile</p>
                </div>
                <div className='h-0.5 w-[95%] bg-neutral-300'></div>
                <div className='flex flex-col items-start justify-center gap-6'>
                    <div className='flex items-center gap-3'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="black" stroke-width="1.5" />
                        </svg>
                        <p>Name : {student.userId.name}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>

                        <p>Email : {student.userId.email}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.77762 11.9424C2.8296 10.2893 2.37185 8.93948 2.09584 7.57121C1.68762 5.54758 2.62181 3.57081 4.16938 2.30947C4.82345 1.77638 5.57323 1.95852 5.96 2.6524L6.83318 4.21891C7.52529 5.46057 7.87134 6.08139 7.8027 6.73959C7.73407 7.39779 7.26737 7.93386 6.33397 9.00601L3.77762 11.9424ZM3.77762 11.9424C5.69651 15.2883 8.70784 18.3013 12.0576 20.2224M12.0576 20.2224C13.7107 21.1704 15.0605 21.6282 16.4288 21.9042C18.4524 22.3124 20.4292 21.3782 21.6905 19.8306C22.2236 19.1766 22.0415 18.4268 21.3476 18.04L19.7811 17.1668C18.5394 16.4747 17.9186 16.1287 17.2604 16.1973C16.6022 16.2659 16.0661 16.7326 14.994 17.666L12.0576 20.2224Z" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                        <p>Phone No. : +91 {student.userId.phoneNo == undefined ? "98 XXXX XXXX" : student.userId.phoneNo}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z" stroke="black" stroke-width="1.5" />
                            <path d="M12 20C13.1046 20 14 19.1046 14 18C14 16.8954 13.1046 16 12 16C10.8954 16 10 16.8954 10 18C10 19.1046 10.8954 20 12 20Z" stroke="black" stroke-width="1.5" />
                            <path d="M18 8C19.1046 8 20 7.10457 20 6C20 4.89543 19.1046 4 18 4C16.8954 4 16 4.89543 16 6C16 7.10457 16.8954 8 18 8Z" stroke="black" stroke-width="1.5" />
                            <path d="M6.01734 8.74067C6.01734 10.4142 5.77537 12.1995 9.22051 11.9855H12.0053M12.0053 11.9855H15.7861C16.9199 11.7648 18.1259 11.9855 17.9929 8.57617M12.0053 11.9855V15.7001" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                        <p>Department : {student.department == undefined ? "undefined" : student.department}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 10L18.1494 10.6448C19.5226 11.0568 20.2092 11.2628 20.6046 11.7942C21 12.3256 21 13.0425 21 14.4761V22" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M8 9H11M8 13H11" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 22V19C12 18.0572 12 17.5858 11.7071 17.2929C11.4142 17 10.9428 17 10 17H9C8.05719 17 7.58579 17 7.29289 17.2929C7 17.5858 7 18.0572 7 19V22" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M2 22H22" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M3 22V6.71724C3 4.20649 3 2.95111 3.79118 2.32824C4.58237 1.70537 5.74742 2.04355 8.07752 2.7199L13.0775 4.17122C14.4836 4.57937 15.1867 4.78344 15.5933 5.33965C16 5.89587 16 6.65344 16 8.16857V22" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>


                        <p>Hostel : {student.userId.hostel == undefined ? "CVR" : student.userId.hostel}</p>
                    </div>
                </div>
                <div className='flex flex-row items-center justify-start gap-10 mt-30'>
                    <div className='bg-[#F4F5F7] text-[#808080] !p-2 rounded-xl cursor-pointer'
                        onClick={() => setIsOpenRoom(true)}
                    >
                        Room change
                    </div>
                    <div className='bg-[#F4F5F7] text-[#808080] !p-2 rounded-xl cursor-pointer'
                        onClick={() => setIsOpenProfile(true)}
                    >
                        Edit Profile
                    </div>
                </div>
            </div>

            {/* about your faculty advisor and mentee */}
            <div className='absolute left-[50%] top-[140px] bg-white flex flex-col gap-5 w-[27%] !p-3 rounded-2xl'>
                <div className='flex items-center justify-between'>
                    <div className='flex gap-3 items-center justify-start'>
                        <img src={userr} className='h-10 w-10 rounded-full' alt="" />
                        <div className='flex flex-col gap-1'>
                            <p>{student.userId.mentorName == undefined ? "Lorem Ipsome" : student.userId.mentorName}</p>
                            <div className='h-0.5 w-[100%] bg-neutral-400'></div>
                            <p className='text-gray-400'>Faculty Advisor</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <svg width="28" height="23" viewBox="0 0 28 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.33325 5.75L10.3984 9.50376C13.3718 10.8876 14.6281 10.8876 17.6014 9.50376L25.6666 5.75" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M2.35165 12.9141C2.42792 15.8519 2.46605 17.3208 3.78571 18.409C5.10535 19.4971 6.94197 19.5349 10.6152 19.6107C12.8791 19.6575 15.1207 19.6575 17.3847 19.6107C21.0579 19.5349 22.8945 19.4971 24.2142 18.409C25.5338 17.3208 25.572 15.8519 25.6482 12.9141C25.6728 11.9694 25.6728 11.0305 25.6482 10.0858C25.572 7.14803 25.5338 5.67913 24.2142 4.59101C22.8945 3.50289 21.0579 3.46499 17.3847 3.38917C15.1207 3.34245 12.8791 3.34245 10.6152 3.38916C6.94197 3.46497 5.10535 3.50287 3.78569 4.591C2.46604 5.67912 2.42792 7.14802 2.35164 10.0858C2.32712 11.0305 2.32713 11.9694 2.35165 12.9141Z" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.77762 10.9424C1.8296 9.2893 1.37185 7.93948 1.09584 6.57121C0.687619 4.54758 1.62181 2.57081 3.16938 1.30947C3.82345 0.776381 4.57323 0.958521 4.96 1.6524L5.83318 3.21891C6.52529 4.46057 6.87134 5.08139 6.8027 5.73959C6.73407 6.39779 6.26737 6.93386 5.33397 8.00601L2.77762 10.9424ZM2.77762 10.9424C4.69651 14.2883 7.70784 17.3013 11.0576 19.2224M11.0576 19.2224C12.7107 20.1704 14.0605 20.6282 15.4288 20.9042C17.4524 21.3124 19.4292 20.3782 20.6905 18.8306C21.2236 18.1766 21.0415 17.4268 20.3476 17.04L18.7811 16.1668C17.5394 15.4747 16.9186 15.1287 16.2604 15.1973C15.6022 15.2659 15.0661 15.7326 13.994 16.666L11.0576 19.2224Z" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                        <svg width="30" height="25" viewBox="0 0 30 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.3999 2C3.75019 2 2.3999 3.12524 2.3999 4.5V20.5C2.3999 21.8748 3.75019 23 5.3999 23H24.5999C26.2496 23 27.5999 21.8748 27.5999 20.5V4.5C27.5999 3.12524 26.2496 2 24.5999 2H5.3999ZM5.3999 3H24.5999C25.601 3 26.3999 3.66576 26.3999 4.5V20.5C26.3999 21.3342 25.601 22 24.5999 22H5.3999C4.39881 22 3.5999 21.3342 3.5999 20.5V4.5C3.5999 3.66576 4.39881 3 5.3999 3ZM8.3999 5.50586C7.74277 5.50586 7.15143 5.66954 6.71357 5.97656C6.27571 6.28359 6.00693 6.74226 6.00693 7.2334C6.00693 8.16699 6.97867 8.8948 8.21475 8.9668L8.21709 8.96777C8.27599 8.9845 8.33768 8.9934 8.3999 8.99414C9.76371 8.99414 10.7929 8.19804 10.7929 7.2334C10.7928 7.2246 10.7924 7.21581 10.7917 7.20703C10.7306 6.25692 9.71417 5.50586 8.3999 5.50586ZM8.3999 6.49414C9.23524 6.49414 9.56508 6.80502 9.60107 7.24609C9.59378 7.67422 9.27596 8.00586 8.3999 8.00586C7.56866 8.00586 7.19287 7.65111 7.19287 7.2334C7.19287 7.02454 7.28432 6.86715 7.47647 6.73242C7.6686 6.59769 7.97704 6.49414 8.3999 6.49414ZM6.5999 9.5C6.44078 9.50001 6.28817 9.5527 6.17566 9.64646C6.06314 9.74023 5.99992 9.8674 5.9999 10V19.5C5.99992 19.6326 6.06314 19.7598 6.17566 19.8535C6.28817 19.9473 6.44078 20 6.5999 20H10.1999C10.359 20 10.5116 19.9473 10.6241 19.8535C10.7367 19.7598 10.7999 19.6326 10.7999 19.5V16.5674V10C10.7999 9.8674 10.7367 9.74023 10.6241 9.64646C10.5116 9.5527 10.359 9.50001 10.1999 9.5H6.5999ZM11.9999 9.5C11.8408 9.50001 11.6882 9.5527 11.5757 9.64646C11.4631 9.74023 11.3999 9.8674 11.3999 10V19.5C11.3999 19.6326 11.4631 19.7598 11.5757 19.8535C11.6882 19.9473 11.8408 20 11.9999 20H15.5999C15.759 20 15.9116 19.9473 16.0241 19.8535C16.1367 19.7598 16.1999 19.6326 16.1999 19.5V14.5C16.1999 14.0852 16.3357 13.6725 16.5749 13.4023C16.8141 13.1322 17.1158 12.97 17.6894 12.9785C18.2808 12.987 18.5939 13.1558 18.8308 13.4209C19.0676 13.686 19.1999 14.0833 19.1999 14.5V19.5C19.1999 19.6326 19.2631 19.7598 19.3757 19.8535C19.4882 19.9473 19.6408 20 19.7999 20H23.3999C23.559 20 23.7116 19.9473 23.8242 19.8535C23.9367 19.7598 23.9999 19.6326 23.9999 19.5V14.1309C23.9999 12.6501 23.4736 11.4772 22.5714 10.6836C21.6692 9.89002 20.4144 9.5 19.0874 9.5C17.8262 9.5 16.8664 9.85244 16.1999 10.2119V10C16.1999 9.8674 16.1367 9.74023 16.0241 9.64646C15.9116 9.5527 15.759 9.50001 15.5999 9.5H11.9999ZM7.1999 10.5H9.5999V16.5674V19H7.1999V10.5ZM12.5999 10.5H14.9999V11.2803C14.9999 11.3851 15.0395 11.4873 15.113 11.5724C15.1866 11.6574 15.2903 11.7211 15.4097 11.7544C15.529 11.7876 15.6578 11.7888 15.778 11.7577C15.8981 11.7266 16.0035 11.6648 16.0792 11.5811C16.0792 11.5811 17.0214 10.5 19.0874 10.5C20.1394 10.5 21.0415 10.7913 21.7007 11.3711C22.3598 11.9509 22.7999 12.8441 22.7999 14.1309V19H20.3999V14.5C20.3999 13.9167 20.2322 13.3136 19.794 12.8232C19.3559 12.3329 18.619 11.9915 17.7105 11.9785C16.7972 11.965 16.0484 12.3135 15.6093 12.8096C15.1701 13.3056 14.9999 13.9148 14.9999 14.5V19H12.5999V10.5Z" fill="#808080" />
                        </svg>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.3927 8.03168L18.6457 6.51461C17.3871 5.42153 16.8937 4.83352 16.2121 5.04139C15.3622 5.30059 15.642 6.93609 15.642 7.48824C14.3206 7.48824 12.9468 7.38661 11.6443 7.59836C7.34453 8.29742 6 11.3566 6 14.6525C7.21697 13.9065 8.43274 13.0746 9.8954 12.7289C11.7212 12.2973 13.7603 12.5032 15.642 12.5032C15.642 13.0554 15.3622 14.6909 16.2121 14.9501C16.9844 15.1856 17.3871 14.5699 18.6457 13.4769L20.3927 11.9598C21.4642 11.0293 22 10.564 22 9.99574C22 9.4275 21.4642 8.96223 20.3927 8.03168Z" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10.5676 3C6.70735 3.00694 4.68594 3.10152 3.39411 4.39073C2 5.78202 2 8.02125 2 12.4997C2 16.9782 2 19.2174 3.3941 20.6087C4.78821 22 7.03198 22 11.5195 22C16.0071 22 18.2509 22 19.645 20.6087C20.6156 19.64 20.9104 18.2603 21 16" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className='h-0.5 w-[95%] bg-neutral-300'></div>
                <div className='!p-2'>
                    <p className='text-neutral-400'>About: </p>
                    <p className='!pl-5'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cupiditate sunt velit reprehenderit? Dolorem iusto, fugit sed et sapiente rem! Dicta sunt quasi reiciendis recusandae consectetur ea officia eligendi error. Corporis!</p>
                </div>
            </div>

            <div className='absolute left-[50%] top-[440px] bg-white flex flex-col gap-5 w-[27%] !p-3 rounded-2xl'>
                <div className='flex items-center justify-between'>
                    <div className='flex gap-3 items-center justify-start'>
                        <img src={userr} className='h-10 w-10 rounded-full' alt="" />
                        <div className='flex flex-col gap-1'>
                            <p>{student.userId.mentorName == undefined ? "Lorem Ipsome" : student.userId.mentorName}</p>
                            <div className='h-0.5 w-[100%] bg-neutral-400'></div>
                            <p className='text-gray-400'>Mentor</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <svg width="28" height="23" viewBox="0 0 28 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.33325 5.75L10.3984 9.50376C13.3718 10.8876 14.6281 10.8876 17.6014 9.50376L25.6666 5.75" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M2.35165 12.9141C2.42792 15.8519 2.46605 17.3208 3.78571 18.409C5.10535 19.4971 6.94197 19.5349 10.6152 19.6107C12.8791 19.6575 15.1207 19.6575 17.3847 19.6107C21.0579 19.5349 22.8945 19.4971 24.2142 18.409C25.5338 17.3208 25.572 15.8519 25.6482 12.9141C25.6728 11.9694 25.6728 11.0305 25.6482 10.0858C25.572 7.14803 25.5338 5.67913 24.2142 4.59101C22.8945 3.50289 21.0579 3.46499 17.3847 3.38917C15.1207 3.34245 12.8791 3.34245 10.6152 3.38916C6.94197 3.46497 5.10535 3.50287 3.78569 4.591C2.46604 5.67912 2.42792 7.14802 2.35164 10.0858C2.32712 11.0305 2.32713 11.9694 2.35165 12.9141Z" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.77762 10.9424C1.8296 9.2893 1.37185 7.93948 1.09584 6.57121C0.687619 4.54758 1.62181 2.57081 3.16938 1.30947C3.82345 0.776381 4.57323 0.958521 4.96 1.6524L5.83318 3.21891C6.52529 4.46057 6.87134 5.08139 6.8027 5.73959C6.73407 6.39779 6.26737 6.93386 5.33397 8.00601L2.77762 10.9424ZM2.77762 10.9424C4.69651 14.2883 7.70784 17.3013 11.0576 19.2224M11.0576 19.2224C12.7107 20.1704 14.0605 20.6282 15.4288 20.9042C17.4524 21.3124 19.4292 20.3782 20.6905 18.8306C21.2236 18.1766 21.0415 17.4268 20.3476 17.04L18.7811 16.1668C17.5394 15.4747 16.9186 15.1287 16.2604 15.1973C15.6022 15.2659 15.0661 15.7326 13.994 16.666L11.0576 19.2224Z" stroke="#808080" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                        <svg width="30" height="25" viewBox="0 0 30 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.3999 2C3.75019 2 2.3999 3.12524 2.3999 4.5V20.5C2.3999 21.8748 3.75019 23 5.3999 23H24.5999C26.2496 23 27.5999 21.8748 27.5999 20.5V4.5C27.5999 3.12524 26.2496 2 24.5999 2H5.3999ZM5.3999 3H24.5999C25.601 3 26.3999 3.66576 26.3999 4.5V20.5C26.3999 21.3342 25.601 22 24.5999 22H5.3999C4.39881 22 3.5999 21.3342 3.5999 20.5V4.5C3.5999 3.66576 4.39881 3 5.3999 3ZM8.3999 5.50586C7.74277 5.50586 7.15143 5.66954 6.71357 5.97656C6.27571 6.28359 6.00693 6.74226 6.00693 7.2334C6.00693 8.16699 6.97867 8.8948 8.21475 8.9668L8.21709 8.96777C8.27599 8.9845 8.33768 8.9934 8.3999 8.99414C9.76371 8.99414 10.7929 8.19804 10.7929 7.2334C10.7928 7.2246 10.7924 7.21581 10.7917 7.20703C10.7306 6.25692 9.71417 5.50586 8.3999 5.50586ZM8.3999 6.49414C9.23524 6.49414 9.56508 6.80502 9.60107 7.24609C9.59378 7.67422 9.27596 8.00586 8.3999 8.00586C7.56866 8.00586 7.19287 7.65111 7.19287 7.2334C7.19287 7.02454 7.28432 6.86715 7.47647 6.73242C7.6686 6.59769 7.97704 6.49414 8.3999 6.49414ZM6.5999 9.5C6.44078 9.50001 6.28817 9.5527 6.17566 9.64646C6.06314 9.74023 5.99992 9.8674 5.9999 10V19.5C5.99992 19.6326 6.06314 19.7598 6.17566 19.8535C6.28817 19.9473 6.44078 20 6.5999 20H10.1999C10.359 20 10.5116 19.9473 10.6241 19.8535C10.7367 19.7598 10.7999 19.6326 10.7999 19.5V16.5674V10C10.7999 9.8674 10.7367 9.74023 10.6241 9.64646C10.5116 9.5527 10.359 9.50001 10.1999 9.5H6.5999ZM11.9999 9.5C11.8408 9.50001 11.6882 9.5527 11.5757 9.64646C11.4631 9.74023 11.3999 9.8674 11.3999 10V19.5C11.3999 19.6326 11.4631 19.7598 11.5757 19.8535C11.6882 19.9473 11.8408 20 11.9999 20H15.5999C15.759 20 15.9116 19.9473 16.0241 19.8535C16.1367 19.7598 16.1999 19.6326 16.1999 19.5V14.5C16.1999 14.0852 16.3357 13.6725 16.5749 13.4023C16.8141 13.1322 17.1158 12.97 17.6894 12.9785C18.2808 12.987 18.5939 13.1558 18.8308 13.4209C19.0676 13.686 19.1999 14.0833 19.1999 14.5V19.5C19.1999 19.6326 19.2631 19.7598 19.3757 19.8535C19.4882 19.9473 19.6408 20 19.7999 20H23.3999C23.559 20 23.7116 19.9473 23.8242 19.8535C23.9367 19.7598 23.9999 19.6326 23.9999 19.5V14.1309C23.9999 12.6501 23.4736 11.4772 22.5714 10.6836C21.6692 9.89002 20.4144 9.5 19.0874 9.5C17.8262 9.5 16.8664 9.85244 16.1999 10.2119V10C16.1999 9.8674 16.1367 9.74023 16.0241 9.64646C15.9116 9.5527 15.759 9.50001 15.5999 9.5H11.9999ZM7.1999 10.5H9.5999V16.5674V19H7.1999V10.5ZM12.5999 10.5H14.9999V11.2803C14.9999 11.3851 15.0395 11.4873 15.113 11.5724C15.1866 11.6574 15.2903 11.7211 15.4097 11.7544C15.529 11.7876 15.6578 11.7888 15.778 11.7577C15.8981 11.7266 16.0035 11.6648 16.0792 11.5811C16.0792 11.5811 17.0214 10.5 19.0874 10.5C20.1394 10.5 21.0415 10.7913 21.7007 11.3711C22.3598 11.9509 22.7999 12.8441 22.7999 14.1309V19H20.3999V14.5C20.3999 13.9167 20.2322 13.3136 19.794 12.8232C19.3559 12.3329 18.619 11.9915 17.7105 11.9785C16.7972 11.965 16.0484 12.3135 15.6093 12.8096C15.1701 13.3056 14.9999 13.9148 14.9999 14.5V19H12.5999V10.5Z" fill="#808080" />
                        </svg>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.3927 8.03168L18.6457 6.51461C17.3871 5.42153 16.8937 4.83352 16.2121 5.04139C15.3622 5.30059 15.642 6.93609 15.642 7.48824C14.3206 7.48824 12.9468 7.38661 11.6443 7.59836C7.34453 8.29742 6 11.3566 6 14.6525C7.21697 13.9065 8.43274 13.0746 9.8954 12.7289C11.7212 12.2973 13.7603 12.5032 15.642 12.5032C15.642 13.0554 15.3622 14.6909 16.2121 14.9501C16.9844 15.1856 17.3871 14.5699 18.6457 13.4769L20.3927 11.9598C21.4642 11.0293 22 10.564 22 9.99574C22 9.4275 21.4642 8.96223 20.3927 8.03168Z" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10.5676 3C6.70735 3.00694 4.68594 3.10152 3.39411 4.39073C2 5.78202 2 8.02125 2 12.4997C2 16.9782 2 19.2174 3.3941 20.6087C4.78821 22 7.03198 22 11.5195 22C16.0071 22 18.2509 22 19.645 20.6087C20.6156 19.64 20.9104 18.2603 21 16" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className='h-0.5 w-[95%] bg-neutral-300'></div>
                <div className='!p-2'>
                    <p className='text-neutral-400'>About: </p>
                    <p className='!pl-5'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cupiditate sunt velit reprehenderit? Dolorem iusto, fugit sed et sapiente rem! Dicta sunt quasi reiciendis recusandae consectetur ea officia eligendi error. Corporis!</p>
                </div>
            </div>

            {isOpenRoom && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-opacity-20 backdrop-blur-sm" onClick={() => setIsOpenRoom(false)}></div>

                    <div className="relative bg-[#1360AB] w-[40%] p-6 rounded-[12px] shadow-lg">
                        <button className="absolute top-3 right-3 text-white text-xl" onClick={() => setIsOpenRoom(false)}>
                            &times;
                        </button>

                        <h2 className="text-white text-xl font-semibold mb-4">Apply for Room Change</h2>

                        <div className="flex flex-col gap-3">
                            <input type="text" placeholder="Preferred Room No.-" className="p-2 rounded-[12px] bg-gray-200 w-full" />
                            <textarea placeholder="Reason For Room Change-" className="p-2 bg-gray-200 rounded-lg w-full h-[100px]" />

                            <button className="bg-green-500 text-black px-6 py-2 rounded-md hover:bg-green-600" onClick={() => alert("Room change request submitted")}>
                                SUBMIT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isOpenProfile && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-opacity-20 backdrop-blur-sm"
                        onClick={() => setIsOpenProfile(false)}
                    ></div>

                    <div className="relative bg-[#1360AB] w-[40%] p-6 rounded-[12px] shadow-lg">
                        <button
                            className="absolute top-3 right-3 text-white text-xl"
                            onClick={() => setIsOpenProfile(false)}
                        >
                            &times;
                        </button>

                        <h2 className="text-white text-xl font-semibold mb-4">Edit Profile</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Name"
                                className="p-2 rounded-[12px] bg-gray-200 w-full"
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="p-2 rounded-[12px] bg-gray-200 w-full"
                            />
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone No."
                                className="p-2 rounded-[12px] bg-gray-200 w-full"
                            />
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Department"
                                className="p-2 rounded-[12px] bg-gray-200 w-full"
                            />
                            <input
                                type="text"
                                name="hostel"
                                value={formData.hostel}
                                onChange={handleChange}
                                placeholder="Hostel"
                                className="p-2 rounded-[12px] bg-gray-200 w-full"
                            />

                            <button
                                type="submit"
                                className="bg-green-500 text-black px-6 py-2 rounded-md hover:bg-green-600"
                            >
                                UPDATE
                            </button>
                        </form>
                    </div>
                </div>
            )}


        </div>
    )
}

export default Settings
