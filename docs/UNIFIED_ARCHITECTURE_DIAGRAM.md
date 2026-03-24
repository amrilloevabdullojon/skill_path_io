# UNIFIED ARCHITECTURE DIAGRAM

```text
                         +----------------------+
                         |   app/(student)      |
                         | dashboard, tracks,   |
                         | modules, missions... |
                         +----------+-----------+
                                    |
                                    v
                        +-----------+------------+
                        |  Service Facades       |
                        |  lib/* (ai, career,    |
                        |  planner, matching,    |
                        |  analytics, learning)  |
                        +-----------+------------+
                                    |
          +-------------------------+--------------------------+
          |                         |                          |
          v                         v                          v
+---------+---------+   +-----------+-----------+   +----------+----------+
| Features Engines  |   | Unified AI Layer      |   | Learning Bridge      |
| features/*        |   | lib/ai/*              |   | lib/learning/*       |
| adaptive, quests, |   | mentor/review/        |   | Studio -> Student    |
| missions, social  |   | interview/reco/remed  |   | DTO normalization     |
+---------+---------+   +-----------+-----------+   +----------+----------+
          |                         |                          |
          +-------------------------+--------------------------+
                                    |
                                    v
                           +--------+--------+
                           | app/api/*       |
                           | /api/ai/* +     |
                           | compatibility   |
                           | wrappers         |
                           +--------+--------+
                                    |
                                    v
                  +-----------------+-----------------+
                  | Data Sources                      |
                  | Prisma (real), Mock seeds,        |
                  | localStorage persisted stores      |
                  +------------------------------------+

State layer:
store/user/*, store/learning/*, store/admin/* (segmented entry points with compatibility re-exports)

Admin Studio:
app/admin/* -> components/admin/* -> store/admin/* -> lib/learning/content-bridge
```
