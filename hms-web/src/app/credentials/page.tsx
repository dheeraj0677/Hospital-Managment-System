import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

// Password mapping from scripts/update-all-passwords.js
const PASSWORD_MAP: Record<string, string> = {
    "devi.shetty@hospital.com": "HeartHero<3",
    "paul.farmer@hospital.com": "GlobalHealth!",
    "raghuram.rajan@hospital.com": "OncoCare2024",
    "sanjay.gupta@hospital.com": "BrainTrust#",
    "soumya.swaminathan@hospital.com": "PublicHealth@",
    "arjun.mehta@hospital.com": "Neuro2024!",
    "sneha.rao@hospital.com": "PedsRock1!",
    "vikram.singh@hospital.com": "OrthoBone#",
    "ananya.patel@hospital.com": "DermaSkin$",
    "admin@hospital.com": "admin123",
    "dr.smith@medicare.com": "password123"
};

const DEFAULT_PASSWORD = "password123";

export default async function CredentialsPage() {
    const doctors = await prisma.user.findMany({
        where: { role: "DOCTOR" },
        include: {
            doctorProfile: true,
        },
        orderBy: {
            name: 'asc'
        }
    });

    return (
        <div className="container mx-auto py-10">
            <Card>
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">Doctor Credentials (DEV ONLY)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        These credentials are for development purposes only.
                    </p>
                </div>

                <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="h-12 px-4 font-medium align-middle text-gray-500">Name</th>
                                <th className="h-12 px-4 font-medium align-middle text-gray-500">Specialization</th>
                                <th className="h-12 px-4 font-medium align-middle text-gray-500">Email</th>
                                <th className="h-12 px-4 font-medium align-middle text-gray-500">Password</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {doctors.map((doctor) => {
                                const password = PASSWORD_MAP[doctor.email] || DEFAULT_PASSWORD;
                                const isDefault = password === DEFAULT_PASSWORD && !PASSWORD_MAP[doctor.email];

                                return (
                                    <tr key={doctor.id} className="transition-colors hover:bg-gray-50/50">
                                        <td className="p-4 font-medium">{doctor.name}</td>
                                        <td className="p-4">
                                            {doctor.doctorProfile?.specialization ? (
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-900 hover:bg-blue-200">
                                                    {doctor.doctorProfile.specialization}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-blue-600">{doctor.email}</td>
                                        <td className="p-4">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                                                {password}
                                            </code>
                                            {isDefault && <span className="ml-2 text-xs text-gray-400">(Default)</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
