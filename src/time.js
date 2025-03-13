/*
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Rafael S.                                                               │
  │ v0.0.2                                                                  │
  │                                                                         │
  │ Proprietary and closed.                                                 │
  │ © All rights reserved.                                                  │
  │                                                                         │
  │ The above copyright notice and this permission shall be included in all │
  │ copies or substantial portions of the Software.                         │
  └─────────────────────────────────────────────────────────────────────────┘

  This code is bad. Really, it is.
  It's a mess, but it works for the purpose of the project.

  No, Universities, I don't write code like this every day.

 */

const fs = require("fs");
const path = require("path");

const FILE = path.join("last_run.json");
const INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const unbGuild = "1330675921258020896";

function getLastRunTime() {
  if (fs.existsSync(FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
      return new Date(data.lastRun);
    } catch (error) {
      console.error("Error reading last run file:", error);
    }
  }
  return null;
}

function setLastRunTime() {
  fs.writeFileSync(
    FILE,
    JSON.stringify({ lastRun: new Date().toISOString() }),
    "utf8"
  );
}

/* @param {Client} client */
function executeTask(client, unb) {
  // code here lol
  client.guilds.fetch(unbGuild).then((guild) => {
    let totalPay = 0;
    let totalTax = 0;

    guild.members.fetch().then((members) => {
      console.log(`👥 Ready for ${members.size} members`);
      members.forEach(async (member) => {
        const roles = member._roles;
        if (member.user.id !== "1261719316747911211") return; // test mode
        //return;

        let sueldo = 0;
        let impuestos = 0;
        let gastos = 0;

        let sueldoA = "";
        let impuestosA = "";
        let gastosA = "";

        for (const role of roles) {
          switch (role) {
            case "1330675921371398182": // Gobierno del Peru, 750000
              sueldo += 750000;
              sueldoA += "Gobierno del Peru, ";
              break;

            case "1330675921296035986": // Gasolina, 400
              gastos += 400;
              gastosA += "Gasolina, ";
              break;

            case "1330675921308487763": // Impuesto, 700
              impuestos += 700;
              impuestosA += "Impuesto Inicial, ";
              break;

            case "1330675921296035987": // Impuesto Minimo, 240
              impuestos += 240;
              impuestosA += "Impuesto Minimo, ";
              break;

            case "1330675921308487764": // Impuesto Alto, 700
              impuestos += 700;
              impuestosA += "Impuesto Alto, ";
              break;

            case "1330675921320935455": // Salario Minimo, 800
              sueldo += 800;
              sueldoA += "Salario Minimo, ";
              break;

            case "1330675921308487767": // Salario Medio, 1500
              sueldo += 1500;
              sueldoA += "Salario Medio, ";
              break;

            case "1330675921308487766": // Salario Elevado, 2850
              sueldo += 2850;
              sueldoA += "Salario Elevado, ";
              break;

            case "1334961447419117608": // Salario Gerencial, 3560
              sueldo += 3560;
              sueldoA += "Salario Gerencial, ";
              break;

            default:
              break;
          }
        }

        // remove trails
        sueldoA = sueldoA.replace(/, $/, "") || "No Aplica";
        impuestosA = impuestosA.replace(/, $/, "") || "No Aplica";
        gastosA = gastosA.replace(/, $/, "") || "No Aplica";

        // update unbelievaboat
        await unb.editUserBalance(
          unbGuild,
          member.user.id,
          {
            bank: sueldo - impuestos - gastos,
          },
          `Collect de ${sueldoA}, ${impuestosA}, ${gastosA}`
        );

        // total pay and total tax
        if (member.user.id !== "1335035698801020988") {
          // government salary doesnt count
          totalPay += sueldo;
          totalTax += impuestos;
        }

        // send report
        if (roles.includes("1335773437498757253"))
          return console.log(
            `- 👥 ${member.user.username} decidio ignorar MDs.`
          );
        if (!roles.includes("1335773437498757253"))
          setTimeout(() => {
            try {
              return member.send(
                `\`\`\`ansi\n[1;32mSueldo:[0m[2;37m S/ ${sueldo} [2;30m(${
                  sueldoA.replace(/, $/, "") || "No Aplica"
                })[0m\n[1;31mImpuestos:[0m[2;37m S/ ${impuestos} [2;30m(${
                  impuestosA.replace(/, $/, "") || "No Aplica"
                })[0m\n[1;33mGastos:[0m[2;37m S/ ${gastos} [2;30m(${
                  gastosA.replace(/, $/, "") || "No Aplica"
                })[0m\n[1;37mTotal:[0m[2;37m S/ ${
                  sueldo - impuestos - gastos
                }[0m\n\n[4;30m[0m[2;30mCopyright © Rafael S.R. Todos los derechos reservados. Sistema Avanzado de Economía.[0m[2;37m[0m\n\`\`\`\n\n-# **[IMPORTANTE]** Aceptar estos MDs es opcional. Si no deseas recibirlos, dirigete a <#1330675922289950730> y selecciona el rol de **No Recibir MDs**.`
              );
            } catch (e) {
              if (e.code === 429) {
                // rate-limited, retry.
                setTimeout(() => {
                  return member.send(
                    `\`\`\`ansi\n[1;32mSueldo:[0m[2;37m S/ ${sueldo} [2;30m(${
                      sueldoA.replace(/, $/, "") || "No Aplica"
                    })[0m\n[1;31mImpuestos:[0m[2;37m S/ ${impuestos} [2;30m(${
                      impuestosA.replace(/, $/, "") || "No Aplica"
                    })[0m\n[1;33mGastos:[0m[2;37m S/ ${gastos} [2;30m(${
                      gastosA.replace(/, $/, "") || "No Aplica"
                    })[0m\n[1;37mTotal:[0m[2;37m S/ ${
                      sueldo - impuestos - gastos
                    }[0m\n\n[4;30m[0m[2;30mCopyright (c) Rafael S.R. Todos los derechos reservados. Sistema Avanzado de Economía.[0m[2;37m[0m\`\`\`\n-# **[IMPORTANTE]** Aceptar estos MDs es opcional. Si no deseas recibirlos, dirigete a <#1330675922289950730> y selecciona el rol de **No Recibir MDs**.`
                  );
                }, e.retry_after + 100);
              } else if (e.code === 50007) {
                return console.log(
                  `- 👥 ${member.user.username} tiene los MDs bloqueados.`
                );
              } else {
                return console.log(
                  `- 👥 Error sending to ${member.user.username}: ${e}`
                );
              }
            }
          }, 2000);
      });
    });
  });
  setLastRunTime();
}

module.exports.scheduleNextRun = (client, unb) => {
  const lastRun = getLastRunTime();
  const now = Date.now();

  if (lastRun) {
    const timeSinceLastRun = now - lastRun.getTime();
    const timeUntilNextRun = Math.max(INTERVAL - timeSinceLastRun, 0);
    console.log(
      `🚀 Next run in ${Math.floor(timeUntilNextRun / 1000 / 60)} minutes`
    );
    setTimeout(() => {
      executeTask(client, unb);
      setInterval(() => {
        executeTask(client, unb);
      }, INTERVAL);
    }, timeUntilNextRun);
  } else {
    executeTask(client, unb);
    setInterval(() => {
      executeTask(client, unb);
    }, INTERVAL);
  }
};
